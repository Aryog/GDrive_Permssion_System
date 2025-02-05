import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { config } from "../../config";
import { users } from "./user";

export const files = pgTable(config.database.tables.FILES, {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull(), // 'file' or 'folder'
    mimeType: text("mime_type"),
    size: text("size"),
    parentId: uuid("parent_id").references((): any => files.id),
    ownerId: uuid("owner_id").references(() => users.id).notNull(),
    path: text("path").notNull(),
    fileUrl: text("file_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}); 