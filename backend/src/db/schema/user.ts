import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { config } from "../../config";
import { relations } from 'drizzle-orm';
import { userRoles } from './userRole';

export const users = pgTable(config.database.tables.USERS, {
    id: uuid("id").defaultRandom().primaryKey(),
    kindeId: varchar("kinde_id", { length: 256 }).notNull().unique(),
    email: varchar("email").notNull().unique(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    picture: text("picture"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
    userRoles: many(userRoles, { relationName: 'user' })
}));
