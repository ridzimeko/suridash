import { Hono } from "hono";
import { db } from "@/db";
import { alerts } from "@/db/schema/dashboard-schema";
import { asc, desc, and, eq, sql } from "drizzle-orm";
import type { AppEnv } from "@/types";

export const alertsRoute = new Hono<AppEnv>();

// PATH AUTOMATIS JADI: /api/alerts
alertsRoute.get("/alerts", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const page = Number(c.req.query("page") ?? 1);
  const limit = Number(c.req.query("limit") ?? 20);
  const offset = (page - 1) * limit;

  const severity = c.req.query("severity");
  const srcIp = c.req.query("src_ip");
  const sort = c.req.query("sort") === "asc" ? "asc" : "desc";

  const where = [];
  if (severity) where.push(eq(alerts.severity, Number(severity)));
  if (srcIp) where.push(eq(alerts.srcIp, srcIp));

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(alerts)
    .where(where.length ? and(...where) : undefined);

  const rows = await db
    .select()
    .from(alerts)
    .where(where.length ? and(...where) : undefined)
    .orderBy(sort === "asc" ? asc(alerts.createdAt) : desc(alerts.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    page,
    limit,
    total: Number(total[0].count),
    data: rows,
  });
});

// PATH AUTOMATIS JADI: /api/alerts/:id
alertsRoute.get("/alerts/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const id = Number(c.req.param("id"));
  const row = await db.select().from(alerts).where(eq(alerts.id, id)).limit(1);

  if (!row.length) return c.json({ error: "Not found" }, 404);
  return c.json(row[0]);
});
