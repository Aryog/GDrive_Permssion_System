import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { config } from "../../config";

export const users = pgTable(config.database.tables.USERS, {
    id: uuid("id").defaultRandom().primaryKey(),
    kindeId: text("kinde_id").notNull().unique(),
    email: text("email").notNull().unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    picture: text("picture"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
