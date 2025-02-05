import { relations } from 'drizzle-orm';
import { files } from './file';
import { users } from './user';
import { permissions, filePermissions, groups, groupPermissions, groupMembers } from './permission';

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

// Group permissions relations
export const groupPermissionsRelations = relations(groupPermissions, ({ one }) => ({
    file: one(files, {
        fields: [groupPermissions.fileId],
        references: [files.id],
    }),
    group: one(groups, {
        fields: [groupPermissions.groupId],
        references: [groups.id],
    }),
    permission: one(permissions, {
        fields: [groupPermissions.permissionId],
        references: [permissions.id],
    }),
}));

// Group members relations
export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
    group: one(groups, {
        fields: [groupMembers.groupId],
        references: [groups.id],
    }),
    user: one(users, {
        fields: [groupMembers.userId],
        references: [users.id],
    }),
}));

export * from './user';
export * from './file';
export * from './role';
export * from './permission';
export * from './share'; 