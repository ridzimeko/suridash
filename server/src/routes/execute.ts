import { Hono } from "hono";
import { sendCommandToAgent } from "./ws/agent.js";
import { db } from "src/db/index.js";
import { blockedIps } from "src/db/schema/dashboard-schema.js";
import { eq } from "drizzle-orm";

export const executeRoute = new Hono();

executeRoute.post("/execute/block", async (c) => {
    const { blockedIpId, agentId } = await c.req.json();
  
    // ambil data block
    const blocked = await db.query.blockedIps.findFirst({
      where: eq(blockedIps.id, blockedIpId),
    });
  
    if (!blocked) {
      return c.json({ error: "Blocked IP not found" }, 404);
    }
  
    // kirim ke agent
    const sent = sendCommandToAgent(agentId, {
      type: "block_ip",
      ip: blocked.ip,
      duration: blocked.blockedUntil
        ? Math.floor(
            (blocked.blockedUntil.getTime() - Date.now()) / 1000
          )
        : 3600,
    });
  
    if (!sent) {
      await db
        .update(blockedIps)
        .set({
          executionStatus: "failed",
          executionError: "Agent offline",
        })
        .where(eq(blockedIps.id, blockedIpId));
  
      return c.json({ error: "Agent offline" }, 409);
    }
  
    // ✅ EXECUTE BERHASIL → UPDATE LOG
    await db
      .update(blockedIps)
      .set({
        executionStatus: "executed",
        executedAt: new Date(),
        agentId,
      })
      .where(eq(blockedIps.id, blockedIpId));
  
    return c.json({ success: true });
  });
  