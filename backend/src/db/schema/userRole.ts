import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { config } from "../../config";
import { users } from "./user";
import { roles } from "./role";
import { relations } from 'drizzle-orm';

export const userRoles = pgTable(config.database.tables.USER_ROLES, {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    roleId: uuid("role_id").references(() => roles.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, {
        fields: [userRoles.userId],
        references: [users.id],
    }),
    role: one(roles, {
        fields: [userRoles.roleId],
        references: [roles.id],
    }),
})); 