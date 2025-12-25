import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// load environment variables from .env file
import 'dotenv/config';

import * as authSchema from "./schema/auth-schema.js";
import * as dashboardSchema from "./schema/dashboard-schema.js";

// const db = drizzle(process.env.DATABASE_URL as string,
//     {
//         schema: {
//             ...authSchema,
//             ...dashboardSchema
//         }
//     }
// );

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle({ client, schema: {
    ...authSchema,
    ...dashboardSchema
} });

export { db };