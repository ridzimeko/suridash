import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  pgEnum,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const blockExecutionStatusEnum = pgEnum("block_execution_status", [
  "pending",
  "executed",
  "failed",
]);

// 🔹 Riwayat alert penting (bukan semua alert realtime harus disimpan)
export const alerts = pgTable(
  "alerts",
  {
    id: serial("id").primaryKey(),
    agentId: varchar("agent_id", { length: 32 }), // agt_xxx

    // Info IP & koneksi
    srcIp: varchar("src_ip", { length: 45 }).notNull(),
    srcPort: integer("src_port"),
    destIp: varchar("dest_ip", { length: 45 }),
    destPort: integer("dest_port"),
    protocol: varchar("protocol", { length: 15 }),

    // Info Suricata alert
    signatureId: integer("signature_id"),
    signature: varchar("signature", { length: 512 }),
    category: varchar("category", { length: 256 }),
    severity: integer("severity"), // 1 (high) - 3 (low)
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Raw JSON dari Suricata event (opsional tapi berguna)
    raw: jsonb("raw"),
  },
  (table) => ({})
);

// 🔹 Riwayat IP yang diblokir firewall
export const blockedIps = pgTable(
  "blocked_ips",
  {
    id: serial("id").primaryKey(),
    ip: varchar("ip", { length: 45 }).notNull(),
    reason: varchar("reason", { length: 512 }), // misal: "SSH brute force", "port scan"
    agentId: varchar("agent_id", { length: 32 }), // agt_xxx

    // Jika kamu ingin tahu apakah auto-block atau manual admin
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSeen: timestamp("last_seen", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    idxBlockedIp: index("idx_blocked_ips_ip").on(table.ip),
  }),
);

export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),

  // email | telegram | slack | discord | whatsapp
  provider: varchar("provider", { length: 32 }).notNull(),

  // menyimpan API key, chat id, smtp config, dsb.
  config: jsonb("config").notNull(),

  enabled: boolean("enabled").default(true).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
