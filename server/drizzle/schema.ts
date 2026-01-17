import { pgTable, varchar, text, boolean, timestamp, foreignKey, unique, serial, integer, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const agentStatus = pgEnum("agent_status", ['online', 'offline'])
export const blockExecutionStatus = pgEnum("block_execution_status", ['pending', 'executed', 'failed'])


export const agents = pgTable("agents", {
	id: varchar({ length: 32 }).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	hostname: varchar({ length: 100 }),
	ipAddress: varchar("ip_address", { length: 45 }),
	status: agentStatus().default('offline').notNull(),
	token: text().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const alerts = pgTable("alerts", {
	id: serial().primaryKey().notNull(),
	agentId: varchar("agent_id", { length: 32 }),
	srcIp: varchar("src_ip", { length: 45 }).notNull(),
	srcPort: integer("src_port"),
	destIp: varchar("dest_ip", { length: 45 }),
	destPort: integer("dest_port"),
	protocol: varchar({ length: 15 }),
	signatureId: integer("signature_id"),
	signature: varchar({ length: 512 }),
	category: varchar({ length: 256 }),
	severity: integer(),
	geoIp: varchar("geo_ip", { length: 45 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	raw: jsonb(),
});

export const blockedIps = pgTable("blocked_ips", {
	id: serial().primaryKey().notNull(),
	ip: varchar({ length: 45 }).notNull(),
	reason: varchar({ length: 512 }),
	attackType: varchar("attack_type", { length: 128 }),
	blockedUntil: timestamp("blocked_until", { withTimezone: true, mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	alertCount: integer("alert_count").default(0).notNull(),
	agentId: varchar("agent_id", { length: 32 }),
	geoIp: varchar("geo_ip", { length: 45 }),
	autoBlocked: boolean("auto_blocked").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const suricataRules = pgTable("suricata_rules", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 1024 }),
	agentId: varchar("agent_id", { length: 32 }),
	ruleText: varchar("rule_text", { length: 4096 }).notNull(),
	enabled: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const integrations = pgTable("integrations", {
	id: serial().primaryKey().notNull(),
	provider: varchar({ length: 32 }).notNull(),
	config: jsonb().notNull(),
	enabled: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const systemLogs = pgTable("system_logs", {
	id: serial().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	level: varchar({ length: 16 }).default('info').notNull(),
	source: varchar({ length: 64 }).default('backend').notNull(),
	message: varchar({ length: 1024 }).notNull(),
	meta: jsonb(),
});

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);
