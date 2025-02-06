import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { files } from "../db/schema/file";
import { getUser } from "../../kinde";
import { eq, and } from "drizzle-orm";
import { generateUploadUrl, generateReadUrl } from "../services/azure-storage";
import { users } from "../db/schema/user";

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
    .post("/upload-url", async (c) => {
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
    .post("/", async (c) => {
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

            // Create or verify user's root folder exists
            const userRootPath = `/${user.id}`;
            const userRoot = await db.query.files.findFirst({
                where: and(
                    eq(files.path, userRootPath),
                    eq(files.type, "folder"),
                    eq(files.ownerId, user.id)
                )
            });

            if (!userRoot) {
                await db.insert(files).values({
                    name: user.id,
                    type: "folder",
                    path: userRootPath,
                    ownerId: user.id,
                });
            }

            // Adjust the path to be under user's root folder
            const originalPath = parsed.path;
            parsed.path = originalPath.startsWith('/')
                ? `${userRootPath}${originalPath}`
                : `${userRootPath}/${originalPath}`;

            // For files, handle duplicate names by appending a counter
            if (parsed.type === "file") {
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
            }

            // For folders, ensure the entire path exists
            if (parsed.type === "folder") {
                const pathParts = parsed.path.split('/').filter(Boolean);
                let currentPath = "";

                // Create each level of the folder structure if it doesn't exist
                for (const part of pathParts) {
                    currentPath += `/${part}`;
                    const existingFolder = await db.query.files.findFirst({
                        where: and(
                            eq(files.path, currentPath),
                            eq(files.type, "folder"),
                            eq(files.ownerId, user.id)
                        )
                    });

                    if (!existingFolder) {
                        await db.insert(files).values({
                            name: part,
                            type: "folder",
                            path: currentPath,
                            ownerId: user.id,
                        });
                    }
                }
            }

            // If it's a file, generate a read URL
            let fileUrl = undefined;
            if (parsed.type === "file" && parsed.blobName) {
                fileUrl = await generateReadUrl(parsed.blobName);
            }

            const [file] = await db.insert(files).values({
                ...parsed,
                ownerId: user.id,
                blobName: parsed.type === "file" ? parsed.blobName : undefined,
                fileUrl: parsed.type === "file" ? fileUrl : undefined,
            }).returning();

            if (!file) {
                throw new Error("Failed to create file record");
            }

            return c.json({ ...file, fileUrl });
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
        const folderId = c.req.param("folderId");
        const user = await db.query.users.findFirst({
            where: eq(users.kindeId, c.var.user.id)
        });

        if (!user) {
            return c.json({
                error: "User not found",
                details: "User does not exist in database"
            }, 404);
        }

        // If no folderId is provided or it's "root", show the user's root folder contents
        const whereClause = folderId === "root"
            ? and(
                eq(files.path, `/${user.id}`),
                eq(files.ownerId, user.id)
            )
            : and(
                eq(files.parentId, folderId),
                eq(files.ownerId, user.id)
            );

        const items = await db.query.files.findMany({
            where: whereClause
        });

        return c.json(items);
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