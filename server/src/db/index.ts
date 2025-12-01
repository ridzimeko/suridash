import { drizzle } from 'drizzle-orm/neon-http';

// load environment variables from .env file
import 'dotenv/config';

const db = drizzle(process.env.DATABASE_URL as string);

export { db };