import { db } from "./index";
import { roles } from "./schema/role";

async function seed() {
    // Create default roles
    await db.insert(roles)
        .values([
            {
                name: 'admin',
                description: 'School administrator'
            },
            {
                name: 'teacher',
                description: 'Teacher role'
            },
            {
                name: 'student',
                description: 'Student role'
            }
        ])
        .onConflictDoNothing(); // This ensures we don't get errors if roles already exist
}

seed().catch(console.error); 