import { Router } from "express";
import { db } from "../db/index.js";
import { blockedIps } from "../db/schema/dashboard-schema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/block", async (req, res) => {
  const { blockedIpId, agentId } = req.body;

  const blocked = await db.query.blockedIps.findFirst({
    where: eq(blockedIps.id, blockedIpId),
  });

  if (!blocked) {
    return res.status(404).json({ error: "Not found" });
  }

  // const sent = sendCommandToAgent(agentId, {
  //   type: "block_ip",
  //   ip: blocked.ip,
  //   duration: 3600,
  // });

  // if (!sent) {
  //   return res.status(409).json({ error: "Agent offline" });
  // }

  await db
    .update(blockedIps)
    .set({ executionStatus: "executed", executedAt: new Date() })
    .where(eq(blockedIps.id, blockedIpId));

  res.json({ success: true });
});

export default router;
