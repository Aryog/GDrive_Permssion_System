import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { files } from "../db/schema/file";
import { getUser } from "../../kinde";
import { eq, and, sql } from "drizzle-orm";
import { generateUploadUrl, generateReadUrl } from "../services/azure-storage";
import { users } from "../db/schema/user";
import { checkRole } from "../middleware/check-role";

const fileSchema = z.object({
    name: z.string(),
    type: z.enum(["file", "folder"]),
    mimeType: z.string().optional(),
    size: z.string().optional(),
    parentId: z.string().uuid().optional(),
    path: z.string(),
    fileUrl: z.string().optional(),
    blobName: z.string().optional(),
});

const uploadUrlSchema = z.object({
    fileName: z.string(),
    contentType: z.string(),
    path: z.string().optional(),
});

export const fileRoute = new Hono()
    .use("/*", getUser)
    // Get upload URL
    .post("/upload-url", checkRole(['admin', 'teacher']), async (c) => {
        try {
            const data = await c.req.json();
            const parsed = uploadUrlSchema.parse(data);

            // Get user's internal UUID
            const user = await db.query.users.findFirst({
                where: eq(users.kindeId, c.var.user.id)
            });

            if (!user) {
                return c.json({
                    error: "User not found",
                    details: "User does not exist in database"
                }, 404);
            }

            // Get virtual path from the request or use root
            const virtualPath = data.path || '';

            const { url, blobName } = await generateUploadUrl(
                user.id,
                parsed.fileName,
                parsed.contentType,
                virtualPath
            );

            return c.json({ url, blobName });
        } catch (error) {
            console.error("Upload URL generation error:", error);
            return c.json({
                error: "Failed to generate upload URL",
                details: error instanceof Error ? error.message : "Unknown error"
            }, 500);
        }
    })
    // Create file/folder
    .post("/", checkRole(['admin', 'teacher']), async (c) => {
        try {
            const data = await c.req.json();
            const parsed = fileSchema.parse(data);

            // First, get the user's internal UUID using their Kinde ID
            const user = await db.query.users.findFirst({
                where: eq(users.kindeId, c.var.user.id)
            });

            if (!user) {
                return c.json({
                    error: "User not found",
                    details: "User does not exist in database"
                }, 404);
            }

            // Only proceed with file creation, skip folder creation
            if (parsed.type === "file") {
                // Adjust the path to include userId
                const virtualPath = `${user.id}/${parsed.path}`.replace(/\/+/g, '/');
                parsed.path = virtualPath;

                // Handle duplicate names by appending a counter
                let finalName = parsed.name;
                let counter = 1;
                let nameExists = true;

                while (nameExists) {
                    const existingFile = await db.query.files.findFirst({
                        where: and(
                            eq(files.name, finalName),
                            eq(files.path, parsed.path),
                            eq(files.ownerId, user.id),
                            eq(files.type, "file")
                        )
                    });

                    if (!existingFile) {
                        nameExists = false;
                    } else {
                        const nameWithoutExt = parsed.name.replace(/\.[^/.]+$/, "");
                        const ext = parsed.name.split('.').pop();
                        finalName = `${nameWithoutExt} (${counter}).${ext}`;
                        counter++;
                    }
                }
                parsed.name = finalName;

                // Generate read URL if blobName exists
                let fileUrl = undefined;
                if (parsed.blobName) {
                    fileUrl = await generateReadUrl(parsed.blobName);
                }

                // Create file record
                const [file] = await db.insert(files).values({
                    ...parsed,
                    ownerId: user.id,
                    fileUrl,
                }).returning();

                if (!file) {
                    throw new Error("Failed to create file record");
                }

                return c.json({ ...file, fileUrl });
            } else {
                // If it's a folder request, just return success without creating anything
                return c.json({ success: true });
            }
        } catch (error) {
            console.error("File creation error:", error);
            return c.json({
                error: "Failed to create file",
                details: error instanceof Error ? error.message : "Unknown error"
            }, 500);
        }
    })
    // Get file/folder by id
    .get("/:id", async (c) => {
        const id = c.req.param("id");
        const file = await db.query.files.findFirst({
            where: eq(files.id, id)
        });

        if (!file) return c.json({ error: "File not found" }, 404);
        return c.json(file);
    })
    // List files in folder
    .get("/folder/:folderId", async (c) => {
        const virtualPath = c.req.param("folderId");
        const user = await db.query.users.findFirst({
            where: eq(users.kindeId, c.var.user.id)
        });

        if (!user) {
            return c.json({
                error: "User not found",
                details: "User does not exist in database"
            }, 404);
        }

        // Construct the path prefix for the current folder
        const pathPrefix = virtualPath === "root"
            ? `${user.id}/`
            : `${user.id}/${virtualPath}/`;

        // Get all files that have this path prefix
        const dbFiles: typeof files.$inferSelect[] = await db.query.files.findMany({
            where: and(
                eq(files.ownerId, user.id),
                eq(files.type, "file"),
                sql`${files.path} LIKE ${pathPrefix + '%'}`
            ),
            orderBy: sql`name ASC`
        });

        // Extract virtual folders from file paths
        const virtualFolders = new Set<string>();
        const currentLevelFiles: typeof files.$inferSelect[] = [];

        dbFiles.forEach(file => {
            // Remove the user ID and current path prefix from the file path
            const relativePath = file.path.slice(pathPrefix.length);

            if (relativePath.includes('/')) {
                // This file is in a subfolder
                const firstFolder = relativePath.split('/')[0];
                virtualFolders.add(firstFolder);
            } else {
                // This file is in the current folder
                currentLevelFiles.push(file);
            }
        });

        // Construct response with both folders and files
        const response = {
            folders: Array.from(virtualFolders).map(folderName => ({
                id: `${virtualPath === "root" ? "" : virtualPath + "/"}${folderName}`,
                name: folderName,
                type: "folder",
                path: `${pathPrefix}${folderName}`
            })),
            files: currentLevelFiles
        };

        return c.json(response);
    })
    // Update file/folder
    .patch("/:id", async (c) => {
        const id = c.req.param("id");
        const data = await c.req.json();
        const parsed = fileSchema.partial().parse(data);

        const [updated] = await db.update(files)
            .set(parsed)
            .where(eq(files.id, id))
            .returning();

        return c.json(updated);
    })
    // Delete file/folder
    .delete("/:id", async (c) => {
        const id = c.req.param("id");
        await db.delete(files).where(eq(files.id, id));
        return c.json({ success: true });
    }); 