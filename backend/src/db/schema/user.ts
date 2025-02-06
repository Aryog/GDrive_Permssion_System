import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { config } from "../../config";

export const users = pgTable(config.database.tables.USERS, {
    id: uuid("id").defaultRandom().primaryKey(),
    kindeId: varchar("kinde_id", { length: 256 }).notNull().unique(),
    email: varchar("email").notNull().unique(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    picture: text("picture"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
