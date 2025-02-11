import type { Context, Next } from "hono";
import { db } from "../db";
import { users } from "../db/schema/user";
import { eq } from "drizzle-orm";

export const checkRole = (allowedRoles: string[]) => {
    return async (c: Context, next: Next) => {
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

        const hasRole = user?.userRoles.some(ur => allowedRoles.includes(ur.role.name));
        if (!hasRole) {
            return c.json({ error: "Unauthorized" }, 403);
        }
        await next();
    };
}; 