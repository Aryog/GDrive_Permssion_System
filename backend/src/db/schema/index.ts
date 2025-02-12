export * from './user';
export * from './file';
export * from './role';
export * from './permission';
export * from './userRole';
export * from './rolePermission';

import { relations } from 'drizzle-orm';
import { files } from './file';
import { users } from './user';
import { permissions, filePermissions } from './permission';
import { roles } from './role';
import { userRoles } from './userRole';
import { rolePermissions } from './rolePermission';

// File permissions relations
export const filePermissionsRelations = relations(filePermissions, ({ one }) => ({
    file: one(files, {
        fields: [filePermissions.fileId],
        references: [files.id],
    }),
    user: one(users, {
        fields: [filePermissions.userId],
        references: [users.id],
    }),
    permission: one(permissions, {
        fields: [filePermissions.permissionId],
        references: [permissions.id],
    }),
}));

// User relations
export const usersRelations = relations(users, ({ many }) => ({
    userRoles: many(userRoles),
    filePermissions: many(filePermissions)
}));

// Role relations
export const rolesRelations = relations(roles, ({ many }) => ({
    userRoles: many(userRoles),
    rolePermissions: many(rolePermissions)
}));

// UserRole relations
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

// RolePermission relations
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