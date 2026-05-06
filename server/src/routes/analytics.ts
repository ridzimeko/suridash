import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { alerts } from "../db/schema/dashboard-schema.js";
import { sql, desc } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = Router();

// Protect all analytics endpoints
router.use("/", authMiddleware);

/* ------------------------------------
   1. SUMMARY
--------------------------------------- */
router.get("/summary", async (req: Request, res: Response) => {
  try {
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

    res.json({
      total: Number(total),
      severity: {
        high: Number(high),
        medium: Number(medium),
        low: Number(low),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

/* ------------------------------------
   2. ATTACKS BY CATEGORY
--------------------------------------- */
router.get("/attacks-by-category", async (req: Request, res: Response) => {
  try {
    const result = await db
      .select({
        category: alerts.category,
        count: sql<number>`SUM(${alerts.alertCount})`,
      })
      .from(alerts)
      .groupBy(alerts.category)
      .orderBy(desc(sql`SUM(${alerts.alertCount})`));

    const totalCount = result.reduce((sum, item) => sum + Number(item.count), 0);

    const formatted = result.map((item) => ({
      type: item.category || "Unknown",
      count: Number(item.count),
      percentage: totalCount > 0 ? Number(((Number(item.count) / totalCount) * 100).toFixed(1)) : 0,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attacks by category" });
  }
});

/* ------------------------------------
   3. TOP ATTACKERS
--------------------------------------- */
router.get("/top-attackers", async (req: Request, res: Response) => {
  try {
    const result = await db
      .select({
        srcIp: alerts.srcIp,
        count: sql<number>`SUM(${alerts.alertCount})`,
      })
      .from(alerts)
      .groupBy(alerts.srcIp)
      .orderBy(desc(sql`SUM(${alerts.alertCount})`))
      .limit(10);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top attackers" });
  }
});

/* ------------------------------------
   4. ATTACK TIMELINE (24H)
--------------------------------------- */
router.get("/attacks-timeline", async (req: Request, res: Response) => {
  try {
    // Fetch alerts grouped by hour and category (last 7 days, grouped by hour-of-day)
    const result = await db.execute(sql`
      SELECT
        TO_CHAR(date_trunc('hour', updated_at), 'HH24:MI') AS time,
        category,
        SUM(alert_count) as count
      FROM alerts
      GROUP BY time, category
      ORDER BY time ASC
    `);

    // Drizzle returns rows directly as array (postgres driver)
    const rows: any[] = Array.isArray(result) ? result : (result as any).rows ?? [];

    // Transform into what Recharts expects:
    // [{ timestamp: '00:00', category1: count1, category2: count2 }]
    const timelineMap = new Map<string, any>();
    
    // Initialize the last 24 hours with 0 counts to ensure empty hours are shown
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:00`;
      timelineMap.set(timeStr, { timestamp: timeStr });
    }

    // Populate data
    for (const row of rows) {
      const time = row.time;
      if (!timelineMap.has(time)) {
        timelineMap.set(time, { timestamp: time });
      }
      const entry = timelineMap.get(time);
      entry[row.category] = Number(row.count);
    }

    // Convert map to array
    const sortedTimeline = Array.from(timelineMap.values()).sort((a, b) => {
      return a.timestamp.localeCompare(b.timestamp);
    });

    res.json(sortedTimeline);
  } catch (error) {
    console.error("Timeline error:", error);
    res.status(500).json({ error: "Failed to fetch attacks timeline" });
  }
});

export default router;
