import { drizzle } from 'drizzle-orm/neon-http';

// load environment variables from .env file
import 'dotenv/config';

import * as authSchema from "./schema/auth-schema.js";
import * as dashboardSchema from "./schema/dashboard-schema.js";

const db = drizzle(process.env.DATABASE_URL as string,
    {
        schema: {
            ...authSchema,
            ...dashboardSchema
        }
    }
);

export { db };