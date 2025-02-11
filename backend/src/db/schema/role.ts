import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { config, type Role } from "../../config";

export const roles = pgTable(config.database.tables.ROLES, {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique().$type<Role>(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Remove the userRoles relations from here since it's defined in userRole.ts 