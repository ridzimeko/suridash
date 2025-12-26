import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { blockedIps } from "../db/schema/dashboard-schema.js";
import { desc, eq, and, sql } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { unblockIp } from "../services/ipsetService.js";

const router = Router();

/* =========================
 * AUTH MIDDLEWARE
 * Semua route /blocked-ips
 * ========================= */
router.use("/blocked-ips", authMiddleware);

/* -------------------------------------------------
   GET /api/blocked-ips?page=1&limit=20&active=true
--------------------------------------------------- */
router.get("/blocked-ips", async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const active = req.query.active as string | undefined;
  const offset = (page - 1) * limit;

  const filters: any[] = [];

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
router.get("/blocked-ips/:id", async (req: Request, res: Response) => {
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
router.post("/blocked-ips", async (req: Request, res: Response) => {
  const body = req.body;

  if (!body?.ip) {
    return res.status(400).json({ error: "IP address required" });
  }

  const [inserted] = await db
    .insert(blockedIps)
    .values({
      ip: body.ip,
      reason: body.reason ?? "Manual block",
      attackType: body.attackType ?? "Unknown",
      createdAt: new Date(),
      blockedUntil: body.blockedUntil
        ? new Date(body.blockedUntil)
        : null,
      isActive: true,
      autoBlocked: false,
      executionStatus: "pending",
      alertCount: 0,
      city: body.city ?? null,
      country: body.country ?? null,
    })
    .returning();

  return res.status(201).json({ success: true, data: inserted });
});

/* -------------------------------------------------
   PUT /api/blocked-ips/:id
   Body: { reason?, attackType?, blockedUntil?, isActive? }
--------------------------------------------------- */
router.put("/blocked-ips/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const body = req.body;

  const updated = await db
    .update(blockedIps)
    .set({
      reason: body.reason,
      attackType: body.attackType,
      blockedUntil: body.blockedUntil
        ? new Date(body.blockedUntil)
        : undefined,
      isActive: body.isActive,
      updatedAt: new Date(),
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
router.delete("/blocked-ips/:id", async (req: Request, res: Response) => {
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
router.post(
  "/blocked-ips/:id/unblock",
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const updated = await unblockIp({ id });
    return res.json({ success: true, data: updated });
  }
);

export default router;
