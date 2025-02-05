import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { filePermissions, permissions } from "../db/schema/permission";
import { users } from "../db/schema/user";
import { getUser } from "../../kinde";
import { eq, and } from "drizzle-orm";
import { PermissionEnum } from "../config";

const permissionSchema = z.object({
    name: z.nativeEnum(PermissionEnum),
    description: z.string().optional(),
});

const filePermissionSchema = z.object({
    fileId: z.string().uuid(),
    userId: z.string().uuid(),
    permissionId: z.string().uuid(),
});

export const permissionRoute = new Hono()
    .use("/*", getUser)
    // Create permission type
    .post("/types", async (c) => {
        const data = await c.req.json();
        const parsed = permissionSchema.parse(data);

        const [permission] = await db.insert(permissions)
            .values({
                name: parsed.name,
                description: parsed.description || null
            } satisfies typeof permissions.$inferInsert)
            .returning();

        return c.json(permission);
    })
    // Grant permission to user
    .post("/grant", async (c) => {
        const data = await c.req.json();
        const parsed = filePermissionSchema.parse(data);

        const [permission] = await db.insert(filePermissions)
            .values(parsed)
            .returning();

        return c.json(permission);
    })
    // Remove permission from user
    .delete("/revoke", async (c) => {
        const { fileId, userId } = await c.req.json();

        await db.delete(filePermissions)
            .where(
                and(
                    eq(filePermissions.fileId, fileId),
                    eq(filePermissions.userId, userId)
                )
            );

        return c.json({ success: true });
    })
    // List file permissions
    .get("/file/:fileId", async (c) => {
        const fileId = c.req.param("fileId");

        const perms = await db
            .select({
                id: filePermissions.id,
                fileId: filePermissions.fileId,
                userId: filePermissions.userId,
                permissionId: filePermissions.permissionId,
                inheritFromParent: filePermissions.inheritFromParent,
                isOwner: filePermissions.isOwner,
                canShare: filePermissions.canShare,
                user: {
                    id: users.id,
                    email: users.email,
                    firstName: users.firstName,
                    lastName: users.lastName
                },
                permission: {
                    id: permissions.id,
                    name: permissions.name
                }
            })
            .from(filePermissions)
            .leftJoin(users, eq(filePermissions.userId, users.id))
            .leftJoin(permissions, eq(filePermissions.permissionId, permissions.id))
            .where(eq(filePermissions.fileId, fileId));

        return c.json(perms);
    }); 