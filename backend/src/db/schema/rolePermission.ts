import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { config } from "../../config";
import { roles } from "./role";
import { permissions } from "./permission";
import { relations } from 'drizzle-orm';

export const rolePermissions = pgTable(config.database.tables.ROLE_PERMISSIONS, {
    id: uuid("id").defaultRandom().primaryKey(),
    roleId: uuid("role_id").references(() => roles.id).notNull(),
    permissionId: uuid("permission_id").references(() => permissions.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
    role: one(roles, {
        fields: [rolePermissions.roleId],
        references: [roles.id],
    }),
    permission: one(permissions, {
        fields: [rolePermissions.permissionId],
        references: [permissions.id],
    }),
})); 