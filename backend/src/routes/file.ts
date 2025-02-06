import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { files } from "../db/schema/file";
import { getUser } from "../../kinde";
import { eq } from "drizzle-orm";
import { generateUploadUrl, generateReadUrl } from "../services/azure-storage";
import { v4 as uuidv4 } from 'uuid';
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
});

export const fileRoute = new Hono()
    .use("/*", getUser)
    // Get upload URL
    .post("/upload-url", async (c) => {
        const data = await c.req.json();
        const parsed = uploadUrlSchema.parse(data);

        const fileId = uuidv4();
        const { url, blobName } = await generateUploadUrl(
            parsed.fileName,
            parsed.contentType
        );

        return c.json({ url, blobName, fileId });
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

            // If it's a file, generate a read URL
            let fileUrl = undefined;
            if (parsed.type === "file" && parsed.blobName) {
                fileUrl = await generateReadUrl(parsed.blobName);
            }

            const [file] = await db.insert(files).values({
                ...parsed,
                ownerId: user.id, // Use the internal UUID
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
        const items = await db.query.files.findMany({
            where: eq(files.parentId, folderId)
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