import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { agents } from "../db/schema/agents.js";
import { desc, eq, sql } from "drizzle-orm";
import {
  alerts as alertsTable,
  blockedIps as blockedIpsTable,
} from "../db/schema/dashboard-schema.js";
import { getInstallScript } from "./installScript.js";

// service functions (anggap sudah ada)
import {
  createAgent,
  listAgents,
  getAgent,
  updateAgent,
  deleteAgent,
} from "../services/agentService.js";
import alerts from "./alerts.js";

const router = Router();

/* =========================
 * CREATE AGENT
 * ========================= */
router.post("/", async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Agent name is required" });
  }

  const result = await createAgent(name);
  return res.status(201).json(result);
});

/* =========================
 * INSTALL SCRIPT
 * ========================= */
router.get("/install.sh", (req: Request, res: Response) => {
  const baseUrl = process.env.APP_BASE_URL ?? "";

  const script = getInstallScript(baseUrl);

  res.setHeader("Content-Type", "text/x-shellscript; charset=utf-8");
  return res.status(200).send(script);
});

/* =========================
 * HEARTBEAT
 * ========================= */
router.post("/heartbeat", async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  const { agent_id } = req.body;

  if (!auth?.startsWith("Bearer ") || !agent_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const apiKey = auth.replace("Bearer ", "");

  const agent = await db.query.agents.findFirst({
    where: eq(agents.id, agent_id),
  });

  if (!agent || agent.token !== apiKey || !agent.isActive) {
    return res.status(403).json({ error: "Invalid agent" });
  }

  await db
    .update(agents)
    .set({
      status: "online",
      lastSeenAt: new Date(),
    })
    .where(eq(agents.id, agent.id));

  return res.json({ success: true });
});

/* =========================
 * READ ALL
 * ========================= */
router.get("/", async (_req: Request, res: Response) => {
  const data = await listAgents();
  return res.json(data);
});

/* =========================
 * READ ONE
 * ========================= */
router.get("/:id", async (req: Request, res: Response) => {
  const agent = await getAgent(req.params.id);

  if (!agent) {
    return res.status(404).json({ message: "Agent not found" });
  }

  return res.json(agent);
});

router.get("/:id/stats", async (req, res) => {
  const { id } = req.params;

  const totalAlerts = await db
    .select({ count: sql<number>`count(*)` })
    .from(alertsTable)
    .where(eq(alertsTable.agentId, id));

  const blockedIps = await db
    .select({ count: sql<number>`count(*)` })
    .from(blockedIpsTable)
    .where(eq(blockedIpsTable.agentId, id));

  res.json({
    totalAlerts: Number(totalAlerts[0]?.count ?? 0),
    blockedIps: Number(blockedIps[0]?.count ?? 0),
  });
});

router.get("/:id/alerts", async (req, res) => {
  const { id } = req.params;
  const limit = Number(req.query.limit ?? 5);

  const rows = await db
    .select({
      id: alertsTable.id,
      signature: alertsTable.signature,
      srcIp: alertsTable.srcIp,
      destIp: alertsTable.destIp,
      severity: alertsTable.severity,
      timestamp: alertsTable.createdAt,
    })
    .from(alertsTable)
    .where(eq(alertsTable.agentId, id))
    .orderBy(desc(alertsTable.createdAt))
    .limit(limit);

  res.json(rows);
});

/* =========================
 * UPDATE
 * ========================= */
router.put("/:id", async (req: Request, res: Response) => {
  const updated = await updateAgent(req.params.id, req.body);

  if (!updated) {
    return res.status(404).json({ message: "Agent not found" });
  }

  return res.json(updated);
});

/* =========================
 * DELETE (SOFT)
 * ========================= */
router.delete("/:id", async (req: Request, res: Response) => {
  await deleteAgent(req.params.id);
  return res.status(204).send();
});

export default router;
