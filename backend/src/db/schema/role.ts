import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { config, type Role } from "../../config";
import { users } from "./user";

export const roles = pgTable(config.database.tables.ROLES, {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique().$type<Role>(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRoles = pgTable(config.database.tables.USER_ROLES, {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    roleId: uuid("role_id").references(() => roles.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}); 