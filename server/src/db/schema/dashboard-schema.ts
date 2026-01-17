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


export const geoIP = pgTable("geoip", {
  id: serial("id").primaryKey(),
  ipAddress: varchar("ip", { length: 45 }).notNull().unique(),
  country: varchar("country", { length: 2 }),
  city: varchar("city", { length: 128 }),
  latitude: varchar("latitude", { length: 32 }),
  longitude: varchar("longitude", { length: 32 }),
  asName: varchar("as_name", { length: 256 }),
  asNumber: integer("as_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

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
    alertCount: integer("alert_count").default(1).notNull(),
    geoipId: integer("geoip_id").references(() => geoIP.id),
    createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

    // Raw JSON dari Suricata event (opsional tapi berguna)
    raw: jsonb("raw"),
  },
  (table) => ({
     uniqueAlert: uniqueIndex("unique_alert_idx").on(
      table.signature,
      table.srcIp,
      table.srcPort,
      table.destIp,
      table.destPort,
      table.protocol
    ),
  })
);

// 🔹 Riwayat IP yang diblokir firewall
export const blockedIps = pgTable(
  "blocked_ips",
  {
    id: serial("id").primaryKey(),
    ip: varchar("ip", { length: 45 }).notNull(),

    reason: varchar("reason", { length: 512 }), // misal: "SSH brute force", "port scan"
    attackType: varchar("attack_type", { length: 128 }), // kategori yang kamu pakai di UI
    blockedUntil: timestamp("blocked_until", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
    alertCount: integer("alert_count").default(0).notNull(),

    // /* =====================
    //  * EXECUTION TRACKING
    //  * ===================== */
    // executionStatus: blockExecutionStatusEnum("execution_status")
    //   .default("pending")
    //   .notNull(),
    // executedAt: timestamp("executed_at", {
    //   withTimezone: true,
    // }),
    // executionError: text("execution_error"),
    agentId: varchar("agent_id", { length: 32 }), // agt_xxx
    geoipId: integer("geoip_id").references(() => geoIP.id),

    // Jika kamu ingin tahu apakah auto-block atau manual admin
    autoBlocked: boolean("auto_blocked").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    idxBlockedIp: index("idx_blocked_ips_ip").on(table.ip),
    idxBlockedActive: index("idx_blocked_ips_active").on(table.isActive),
  })
);

// 🔹 Rules custom yang di-edit dari dashboard
export const suricataRules = pgTable("suricata_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1024 }),
  agentId: varchar("agent_id", { length: 32 }), // agt_xxx

  // isi rule Suricata lengkap
  ruleText: varchar("rule_text", { length: 4096 }).notNull(),

  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),

  // optional: userId untuk tahu siapa yang bikin/edit
  // createdBy: varchar("created_by", { length: 255 }),
});

// 🔹 Log service suricata / backend untuk ditampilkan di System Logs
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  level: varchar("level", { length: 16 }).default("info").notNull(), // info/warn/error
  source: varchar("source", { length: 64 }).default("backend").notNull(), // suricata/backend/firewall
  message: varchar("message", { length: 1024 }).notNull(),
  meta: jsonb("meta"), // detail tambahan (objek JSON)
});

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
