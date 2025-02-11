import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { roles } from "../db/schema/role";
import { users } from "../db/schema/user";
import { getUser } from "../../kinde";
import { eq } from "drizzle-orm";
import { type Role } from "../config";
import { userRoles } from "../db/schema/userRole";

const roleSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});

const assignRoleSchema = z.object({
    userId: z.string().uuid(),
    roleId: z.string().uuid(),
});

export const roleRoute = new Hono()
    .use("/*", getUser)
    // Create new role (Admin only)
    .post("/", async (c) => {
        const user = await db.query.users.findFirst({
            where: eq(users.kindeId, c.var.user.id),
            with: {
                userRoles: {
                    with: {
                        role: true
                    }
                }
            }
        });

        if (!user?.userRoles.some(ur => ur.role.name === 'admin')) {
            return c.json({ error: "Unauthorized" }, 403);
        }

        const data = await c.req.json();
        const parsed = roleSchema.parse(data);

        const [role] = await db.insert(roles)
            .values({
                name: parsed.name as Role,
                description: parsed.description
            })
            .returning();

        return c.json(role);
    })
    // Assign role to user (Admin only)
    .post("/assign", async (c) => {
        const user = await db.query.users.findFirst({
            where: eq(users.kindeId, c.var.user.id),
            with: {
                userRoles: {
                    with: {
                        role: true
                    }
                }
            }
        });

        if (!user?.userRoles.some(ur => ur.role.name === 'admin')) {
            return c.json({ error: "Unauthorized" }, 403);
        }

        const data = await c.req.json();
        const parsed = assignRoleSchema.parse(data);

        const [userRole] = await db.insert(userRoles)
            .values({
                userId: parsed.userId,
                roleId: parsed.roleId
            })
            .returning();

        return c.json(userRole);
    })
    // List all roles (Admin only)
    .get("/", async (c) => {
        const user = await db.query.users.findFirst({
            where: eq(users.kindeId, c.var.user.id),
            with: {
                userRoles: {
                    with: {
                        role: true
                    }
                }
            }
        });

        if (!user?.userRoles.some(ur => ur.role.name === 'admin')) {
            return c.json({ error: "Unauthorized" }, 403);
        }

        const allRoles = await db.query.roles.findMany();
        return c.json(allRoles);
    })
    // Get user's roles
    .get("/me", async (c) => {
        const user = await db.query.users.findFirst({
            where: eq(users.kindeId, c.var.user.id),
            with: {
                userRoles: {
                    with: {
                        role: true
                    }
                }
            }
        });

        if (!user) {
            return c.json({ error: "User not found" }, 404);
        }

        return c.json(user.userRoles.map(ur => ur.role));
    }); 