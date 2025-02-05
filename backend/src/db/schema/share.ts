import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { files } from "./file";
import { permissions } from "./permission";

export const sharedLinks = pgTable("shared_links", {
    id: uuid("id").defaultRandom().primaryKey(),
    fileId: uuid("file_id").references(() => files.id).notNull(),
    token: text("token").notNull().unique(),
    password: text("password"),
    expiresAt: timestamp("expires_at"),
    permissionId: uuid("permission_id").references(() => permissions.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}); 