export enum PermissionEnum {
    OWNER = 'owner',
    EDITOR = 'editor',
    COMMENTER = 'commenter',
    VIEWER = 'viewer',
    NONE = 'none'
}

export const config = {
    database: {
        url: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db',
        tables: {
            USERS: 'users',
            FILES: 'files',
            PERMISSIONS: 'permissions',
            ROLES: 'roles',
            USER_ROLES: 'user_roles',
            ROLE_PERMISSIONS: 'role_permissions',
            FILE_PERMISSIONS: 'file_permissions',
            GROUP_PERMISSIONS: 'group_permissions',
            GROUPS: 'groups',
            GROUP_MEMBERS: 'group_members'
        }
    },
    app: {
        port: parseInt(process.env.PORT || '3000'),
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    },
    permissions: {
        file: {
            OWNER: PermissionEnum.OWNER,
            EDITOR: PermissionEnum.EDITOR,
            COMMENTER: PermissionEnum.COMMENTER,
            VIEWER: PermissionEnum.VIEWER,
            NONE: PermissionEnum.NONE
        },
        FOLDER: {
            CREATE: 'folder:create',
            READ: 'folder:read',
            UPDATE: 'folder:update',
            DELETE: 'folder:delete',
            LIST: 'folder:list',
        },
        ADMIN: {
            MANAGE_USERS: 'admin:manage_users',
            MANAGE_ROLES: 'admin:manage_roles',
            MANAGE_PERMISSIONS: 'admin:manage_permissions',
        }
    },
    roles: {
        ADMIN: 'admin',
        USER: 'user',
        VIEWER: 'viewer',
        EDITOR: 'editor',
    }
} as const;

// Type exports for permissions and roles
export type Permission = typeof config.permissions[keyof typeof config.permissions][keyof typeof config.permissions[keyof typeof config.permissions]];
export type Role = typeof config.roles[keyof typeof config.roles]; 