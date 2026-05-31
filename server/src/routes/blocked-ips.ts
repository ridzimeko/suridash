import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { blockedIps } from "../db/schema/dashboard-schema.js";
import { desc, eq, and, sql } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { sendUnblockIp } from "src/services/blockService.js";

const router = Router();

/* =========================
 * AUTH MIDDLEWARE
 * Semua route /blocked-ips
 * ========================= */
router.use("/", authMiddleware);

/* -------------------------------------------------
   GET /api/blocked-ips?page=1&limit=20
--------------------------------------------------- */
router.get("/", async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 200);
  const offset = (page - 1) * limit;

  const filters: any[] = [];
  
  if (req.query.agentId) {
    filters.push(eq(blockedIps.agentId, String(req.query.agentId)));
  }

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

  return res.json({
    page,
    limit,
    total: Number(total[0].count),
    data: rows,
  });
});

/* -------------------------------------------------
   GET /api/blocked-ips/:id
--------------------------------------------------- */
router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const row = await db
    .select()
    .from(blockedIps)
    .where(eq(blockedIps.id, id))
    .limit(1);

  if (!row.length) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json(row[0]);
});

/* -------------------------------------------------
   POST /api/blocked-ips
   Body: { ip, reason, attackType, blockedUntil }
--------------------------------------------------- */
router.post("/", async (req: Request, res: Response) => {
  const body = req.body;

  if (!body?.ip) {
    return res.status(400).json({ error: "IP address required" });
  }
  if (!body?.agentId) {
    return res.status(400).json({ error: "Agent ID required" });
  }

  const [inserted] = await db
    .insert(blockedIps)
    .values({
      ip: body.ip,
      agentId: body.agentId,
      reason: body.reason ?? "Manual block",
      createdAt: new Date(),
      lastSeen: new Date(),
    })
    .returning();

  return res.status(201).json({ success: true, data: inserted });
});

/* -------------------------------------------------
   PUT /api/blocked-ips/:id
   Body: { reason?, attackType?, blockedUntil?, isActive? }
--------------------------------------------------- */
router.put("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const updated = await db
    .update(blockedIps)
    .set({
      lastSeen: new Date(),
    })
    .where(eq(blockedIps.id, id))
    .returning();

  if (!updated.length) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json({ success: true, data: updated[0] });
});

/* -------------------------------------------------
   DELETE /api/blocked-ips/:id
--------------------------------------------------- */
router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const deleted = await db
    .delete(blockedIps)
    .where(eq(blockedIps.id, id))
    .returning();

  if (!deleted.length) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json({ success: true });
});

/* -------------------------------------------------
   POST /api/blocked-ips/:id/unblock
--------------------------------------------------- */
router.post("/:id/unblock", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }

  const row = await db
    .select()
    .from(blockedIps)
    .where(eq(blockedIps.id, id))
    .limit(1);

  if (!row.length) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  const agentId = row[0].agentId;
  const ip = row[0].ip;
  const ok = sendUnblockIp(agentId, ip);
  if (!ok)
    return res.status(409).json({ success: false, message: "Agent offline" });
  return res.json({ success: true });
});

export default router;
