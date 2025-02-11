export * from './user';
export * from './file';
export * from './role';
export * from './permission';
export * from './share';
export * from './userRole';

import { relations } from 'drizzle-orm';
import { files } from './file';
import { users } from './user';
import { permissions, filePermissions } from './permission';

// Only keep the file permissions relations here
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