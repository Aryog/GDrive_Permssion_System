export enum PermissionEnum {
    ADMIN = 'admin',
    TEACHER = 'teacher',
    STUDENT = 'student',
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
            FILE_PERMISSIONS: 'file_permissions'
        }
    },
    app: {
        port: parseInt(process.env.PORT || '3000'),
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    },
    permissions: {
        ADMIN: {
            MANAGE_USERS: 'admin:manage_users',
            MANAGE_ROLES: 'admin:manage_roles',
            ASSIGN_ROLES: 'admin:assign_roles',
            MANAGE_CONTENT: 'admin:manage_content',
        },
        TEACHER: {
            UPLOAD_CONTENT: 'teacher:upload_content',
            EDIT_CONTENT: 'teacher:edit_content',
            DELETE_CONTENT: 'teacher:delete_content',
            VIEW_CONTENT: 'teacher:view_content',
        },
        STUDENT: {
            VIEW_CONTENT: 'student:view_content',
        }
    },
    roles: {
        ADMIN: 'admin',
        TEACHER: 'teacher',
        STUDENT: 'student',
    }
} as const;

// Type exports for permissions and roles
export type Permission = typeof config.permissions[keyof typeof config.permissions][keyof typeof config.permissions[keyof typeof config.permissions]];
export type Role = typeof config.roles[keyof typeof config.roles]; 