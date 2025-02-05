import { Hono } from "hono";

import { kindeClient, sessionManager } from "../../kinde";
import { getUser } from "../../kinde"
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

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
        // get called every time we login or register
        const url = new URL(c.req.url);
        await kindeClient.handleRedirectToApp(sessionManager(c), url);

        // Get the user data and save to database
        // const user = c.var.user;
        // if (user) {
        //     await saveKindeUserToDatabase(user);
        // }

        return c.redirect("/");
    })
    .get("/logout", async (c) => {
        const logoutUrl = await kindeClient.logout(sessionManager(c));
        return c.redirect(logoutUrl.toString());
    })
    .get("/me", getUser, async (c) => {
        const user = c.var.user
        return c.json({ user });
    });

async function saveKindeUserToDatabase(kindeUser: any) {
    try {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.kindeId, kindeUser.id)
        });

        if (!existingUser) {
            // Insert new user
            await db.insert(users).values({
                kindeId: kindeUser.id,
                email: kindeUser.email,
                firstName: kindeUser.given_name,
                lastName: kindeUser.family_name,
                picture: kindeUser.picture
            });
        }

        // If user exists, no need to update as Kinde is source of truth
        return true;
    } catch (error) {
        console.error('Error saving Kinde user to database:', error);
        throw error;
    }
}