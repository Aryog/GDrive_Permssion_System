import { Hono } from "hono";
import { createMiddleware } from 'hono/factory'
import { kindeClient, sessionManager } from "../../kinde";
import { getUser } from "../../kinde"
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Create middleware to handle user data
const saveUser = createMiddleware(async (c, next) => {
    try {
        const manager = sessionManager(c);
        const isAuthenticated = await kindeClient.isAuthenticated(manager);
        console.log("isAuthenticated", isAuthenticated);
        if (isAuthenticated) {
            const user = await kindeClient.getUserProfile(manager);
            if (user?.id) {
                const existingUser = await db.query.users.findFirst({
                    where: eq(users.kindeId, user.id)
                });
                console.log("existingUser", existingUser);
                if (!existingUser) {
                    await db.insert(users).values({
                        kindeId: user.id,
                        email: user.email,
                        firstName: user.given_name,
                        lastName: user.family_name,
                        picture: user.picture
                    });
                    console.log("User saved to database:", user.email);
                }
            }
        }
        await next();
    } catch (e) {
        console.error("Save user error:", e);
        await next();
    }
});

export const authRoute = new Hono()
    .get("/login", async (c) => {
        const loginUrl = await kindeClient.login(sessionManager(c));
        return c.redirect(loginUrl.toString());
    })
    .get("/register", async (c) => {
        const registerUrl = await kindeClient.register(sessionManager(c));
        return c.redirect(registerUrl.toString());
    })
    .get("/callback", async (c) => {
        const url = new URL(c.req.url);
        const manager = sessionManager(c);
        // Just handle the redirect and set up the session
        await kindeClient.handleRedirectToApp(manager, url);
        return c.redirect("/");
    })
    .get("/logout", async (c) => {
        const logoutUrl = await kindeClient.logout(sessionManager(c));
        return c.redirect(logoutUrl.toString());
    })
    .get("/me", saveUser, getUser, async (c) => {
        const user = c.var.user
        return c.json({ user });
    });