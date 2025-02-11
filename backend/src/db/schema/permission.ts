import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import {
  config,
  PermissionEnum,
} from "../../config";
import { roles } from "./role";
import { files } from "./file";
import { users } from "./user";

export const permissions = pgTable(config.database.tables.PERMISSIONS, {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").$type<PermissionEnum>().notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rolePermissions = pgTable("role_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  roleId: uuid("role_id")
    .references(() => roles.id)
    .notNull(),
  permissionId: uuid("permission_id")
    .references(() => permissions.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const filePermissions = pgTable(
  config.database.tables.FILE_PERMISSIONS,
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fileId: uuid("file_id")
      .references(() => files.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    permissionId: uuid("permission_id")
      .references(() => permissions.id)
      .notNull(),
    inheritFromParent: boolean("inherit_from_parent").default(true).notNull(),
    isOwner: boolean("is_owner").default(false).notNull(),
    canShare: boolean("can_share").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);
