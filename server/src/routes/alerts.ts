import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { alerts } from "../db/schema/dashboard-schema.js";
import { asc, desc, and, eq, sql } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = Router();

/* =========================
 * AUTH MIDDLEWARE
 * PATH: /api/alerts/*
 * ========================= */
router.use("/", authMiddleware);

/* =========================
 * GET ALL ALERTS
 * GET /api/alerts
 * ========================= */
router.get("/", async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const offset = (page - 1) * limit;

  const severity = req.query.severity
    ? Number(req.query.severity)
    : undefined;

  const srcIp = req.query.src_ip as string | undefined;
  const sort = req.query.sort === "asc" ? "asc" : "desc";

  const where: any[] = [];
  if (severity !== undefined) {
    where.push(eq(alerts.severity, severity));
  }
  if (srcIp) {
    where.push(eq(alerts.srcIp, srcIp));
  }

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(alerts)
    .where(where.length ? and(...where) : undefined);

  const rows = await db
    .select()
    .from(alerts)
    .where(where.length ? and(...where) : undefined)
    .orderBy(
      sort === "asc"
        ? asc(alerts.createdAt)
        : desc(alerts.createdAt)
    )
    .limit(limit)
    .offset(offset);

  return res.json({
    page,
    limit,
    total: Number(total[0].count),
    data: rows,
  });
});

/* =========================
 * GET ALERT BY ID
 * GET /api/alerts/:id
 * ========================= */
router.get("/:id", async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const row = await db
    .select()
    .from(alerts)
    .where(eq(alerts.id, id))
    .limit(1);

  if (!row.length) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json(row[0]);
});

export default router;
