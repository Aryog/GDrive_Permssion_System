import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { files } from "../db/schema/file";
import { getUser } from "../../kinde";
import { eq } from "drizzle-orm";

const fileSchema = z.object({
    name: z.string(),
    type: z.enum(["file", "folder"]),
    mimeType: z.string().optional(),
    size: z.string().optional(),
    parentId: z.string().uuid().optional(),
    path: z.string(),
    fileUrl: z.string().optional(),
});

export const fileRoute = new Hono()
    .use("/*", getUser)
    // Create file/folder
    .post("/", async (c) => {
        const data = await c.req.json();
        const parsed = fileSchema.parse(data);

        const [file] = await db.insert(files).values({
            ...parsed,
            ownerId: c.var.user.id,
        }).returning();

        return c.json(file);
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