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

  status: agentStatusEnum("status").default("offline").notNull(),

  token: text("token").notNull(),

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
