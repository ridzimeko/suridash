import { Hono } from "hono";
import type { AppEnv } from "../types";
import { authMiddleware } from "@/middlewares/auth-middleware";
import { db } from "../db";
import { blockedIps } from "@/db/schema/dashboard-schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { unblockIp } from "@/services/ipsetService";

export const blockedRoute = new Hono<AppEnv>();

// Proteksi semua rute ini, kecuali auth
blockedRoute.use("/blocked-ips/*", authMiddleware);

/* -------------------------------------------------
   GET /api/blocked-ips?page=1&limit=20&active=true
--------------------------------------------------- */
blockedRoute.get("/blocked-ips", async (c) => {
  const page = Number(c.req.query("page") ?? 1);
  const limit = Number(c.req.query("limit") ?? 20);
  const active = c.req.query("active");
  const offset = (page - 1) * limit;

  const filters = [];

  if (active === "true") filters.push(eq(blockedIps.isActive, true));
  if (active === "false") filters.push(eq(blockedIps.isActive, false));

  const where = filters.length ? and(...filters) : undefined;

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(blockedIps)
    .where(where);

  const rows = await db
    .select()
    .from(blockedIps)
    .where(where)
    .orderBy(desc(blockedIps.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    page,
    limit,
    total: Number(total[0].count),
    data: rows,
  });
});

/* -------------------------------------------------
   GET /api/blocked-ips/:id
--------------------------------------------------- */
blockedRoute.get("/blocked-ips/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const row = await db
    .select()
    .from(blockedIps)
    .where(eq(blockedIps.id, id))
    .limit(1);

  if (!row.length) return c.json({ error: "Not found" }, 404);

  return c.json(row[0]);
});

/* -------------------------------------------------
   POST /api/blocked-ips
   Body: { ip, reason, attackType, blockedUntil }
--------------------------------------------------- */
blockedRoute.post("/blocked-ips", async (c) => {
  const body = await c.req.json();

  if (!body.ip) {
    return c.json({ error: "IP address required" }, 400);
  }

  const inserted = await db
    .insert(blockedIps)
    .values({
      ip: body.ip,
      reason: body.reason ?? "Manual block",
      attackType: body.attackType ?? "Unknown",
      blockedUntil: body.blockedUntil ? new Date(body.blockedUntil) : null,
      isActive: true,
      autoBlocked: false,
      source: "manual",
    })
    .returning();

  return c.json({ success: true, data: inserted[0] });
});

/* -------------------------------------------------
   PUT /api/blocked-ips/:id
   Body: { reason?, attackType?, blockedUntil?, isActive? }
--------------------------------------------------- */
blockedRoute.put("/blocked-ips/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  const updated = await db
    .update(blockedIps)
    .set({
      reason: body.reason,
      attackType: body.attackType,
      blockedUntil: body.blockedUntil
        ? new Date(body.blockedUntil)
        : undefined,
      isActive: body.isActive,
    })
    .where(eq(blockedIps.id, id))
    .returning();

  if (!updated.length) return c.json({ error: "Not found" }, 404);

  return c.json({ success: true, data: updated[0] });
});

/* -------------------------------------------------
   DELETE /api/blocked-ips/:id
--------------------------------------------------- */
blockedRoute.delete("/blocked-ips/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const deleted = await db
    .delete(blockedIps)
    .where(eq(blockedIps.id, id))
    .returning();

  if (!deleted.length) return c.json({ error: "Not found" }, 404);

  return c.json({ success: true });
});

blockedRoute.post("/blocked-ips/:id/unblock", async (c) => {
  const id = Number(c.req.param("id"));
  const updated = await unblockIp({ id });
  return c.json({ success: true, data: updated });
});

