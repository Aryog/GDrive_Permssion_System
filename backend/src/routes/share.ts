import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { sharedLinks } from "../db/schema/share";
import { getUser } from "../../kinde";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const shareSchema = z.object({
    fileId: z.string().uuid(),
    permissionId: z.string().uuid(),
    password: z.string().optional(),
    expiresAt: z.string().datetime().optional(),
});

export const shareRoute = new Hono()
    .use("/*", getUser)
    // Create share link
    .post("/", async (c) => {
        const data = await c.req.json();
        const parsed = shareSchema.parse(data);

        const [link] = await db.insert(sharedLinks)
            .values({
                ...parsed,
                token: createId(),
                expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null
            } satisfies typeof sharedLinks.$inferInsert)
            .returning();

        return c.json(link);
    })
    // Get share link info
    .get("/:token", async (c) => {
        const token = c.req.param("token");
        const link = await db.query.sharedLinks.findFirst({
            where: eq(sharedLinks.token, token),
            with: {
                file: true,
                permission: true
            }
        });

        if (!link) return c.json({ error: "Link not found" }, 404);
        return c.json(link);
    })
    // Delete share link
    .delete("/:token", async (c) => {
        const token = c.req.param("token");
        await db.delete(sharedLinks)
            .where(eq(sharedLinks.token, token));

        return c.json({ success: true });
    }); 