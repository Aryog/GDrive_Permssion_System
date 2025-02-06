
// Make sure to install the 'postgres' package
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres';

console.log(process.env.DATABASE_URL);
const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
migrate(drizzle(migrationClient), { migrationsFolder: "./drizzle" })
console.log("Migration complete")