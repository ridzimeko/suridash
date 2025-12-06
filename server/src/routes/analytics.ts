import { Hono } from "hono";
import type { AppEnv } from "../types/index.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { db } from "../db/index.js";
import { alerts } from "../db/schema/dashboard-schema.js";
import { sql, desc } from "drizzle-orm";

export const analyticsRoute = new Hono<AppEnv>();

// Proteksi selurun endpoint analytics
analyticsRoute.use("/analytics/*", authMiddleware);

/* ------------------------------------
   1. SUMMARY
--------------------------------------- */
analyticsRoute.get("/analytics/summary", async (c) => {
  const [totalRows, highRows, mediumRows, lowRows] = await Promise.all([
    db.select({ total: sql<number>`count(*)` }).from(alerts),
    db
      .select({ high: sql<number>`count(*)` })
      .from(alerts)
      .where(sql`severity = 1`),
    db
      .select({ medium: sql<number>`count(*)` })
      .from(alerts)
      .where(sql`severity = 2`),
    db
      .select({ low: sql<number>`count(*)` })
      .from(alerts)
      .where(sql`severity = 3`),
  ]);

  const total = totalRows[0]?.total ?? 0;
  const high = highRows[0]?.high ?? 0;
  const medium = mediumRows[0]?.medium ?? 0;
  const low = lowRows[0]?.low ?? 0;

  return c.json({
    total,
    severity: {
      high,
      medium,
      low,
    },
  });
});

/* ------------------------------------
   2. ATTACKS BY CATEGORY
--------------------------------------- */
analyticsRoute.get("/analytics/attacks-by-category", async (c) => {
  const result = await db
    .select({
      category: alerts.category,
      count: sql<number>`COUNT(*)`,
    })
    .from(alerts)
    .groupBy(alerts.category)
    .orderBy(desc(sql`COUNT(*)`));

  return c.json(result);
});

/* ------------------------------------
   3. TOP ATTACKERS
--------------------------------------- */
analyticsRoute.get("/analytics/top-attackers", async (c) => {
  const result = await db
    .select({
      srcIp: alerts.srcIp,
      count: sql<number>`COUNT(*)`,
    })
    .from(alerts)
    .groupBy(alerts.srcIp)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(10);

  return c.json(result);
});

/* ------------------------------------
   4. ATTACK TIMELINE (24H / 7D / 30D)
--------------------------------------- */
analyticsRoute.get("/analytics/attacks-timeline", async (c) => {
  const range = c.req.query("range") ?? "24h";

  let interval = "1 hour";
  let where = sql`created_at >= NOW() - INTERVAL '24 hours'`;

  if (range === "7d") {
    interval = "1 day";
    where = sql`created_at >= NOW() - INTERVAL '7 days'`;
  } else if (range === "30d") {
    interval = "1 day";
    where = sql`created_at >= NOW() - INTERVAL '30 days'`;
  }

  const result = await db.execute(sql`
    SELECT
      date_trunc(${interval}, created_at) AS time,
      COUNT(*) as count
    FROM alerts
    WHERE ${where}
    GROUP BY time
    ORDER BY time ASC
  `);

  return c.json(result.rows);
});
