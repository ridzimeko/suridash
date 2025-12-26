import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * ENUM status agent
 */
export const agentStatusEnum = pgEnum("agent_status", ["online", "offline"]);

export const agents = pgTable("agents", {
  id: varchar("id", { length: 32 }).primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  hostname: varchar("hostname", { length: 100 }),

  ipAddress: varchar("ip_address", { length: 45 }), // IPv4 / IPv6

  status: agentStatusEnum("status").default("offline").notNull(),

  apiKeyHash: text("api_key_hash").notNull(),

  isActive: boolean("is_active").default(true).notNull(),

  lastSeenAt: timestamp("last_seen_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .default(sql`now()`)
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .default(sql`now()`)
    .notNull(),
});
