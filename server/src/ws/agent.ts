import { WebSocket } from "ws";
import { broadcastToDashboard } from "./dashboard.js";
import { saveAlert } from "src/services/alertService.js";
import { registerAgent, unregisterAgent } from "src/lib/wsRegistry.js";
import { blockedIps } from "src/db/schema/dashboard-schema.js";
import { db } from "src/db/index.js";
import { and, eq } from "drizzle-orm";

export function handleAgentWS(ws: WebSocket, req: any) {
  const agentId = req.headers["x-agent-id"] as string;

  if (!agentId) {
    ws.close(1008, "Missing agent id");
    return;
  }

  registerAgent(agentId, ws);
  console.log("Agent connected:", agentId);

  ws.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "system_metrics") {
        broadcastToDashboard({
          agentId,
          type: "system_metrics",
          payload: msg.payload,
          timestamp: msg.timestamp,
        });
      }

      if (msg.type === "agent_status") {
        broadcastToDashboard({
          agentId,
          type: "agent_status",
          payload: msg.payload,
          timestamp: msg.timestamp,
        });
      }

      if (msg.type === "suricata_alert") {
        const result = await saveAlert(agentId, msg.payload);

        if (!result || result.existing) return;

        broadcastToDashboard({
          agentId,
          type: "suricata_alert",
          payload: msg.payload,
          timestamp: msg.timestamp,
        });
      }

      if (msg.type === "block_ip_ack") {
        console.log("ACK from agent:", agentId, msg);

        if (msg.ok) {
          await db
            .insert(blockedIps)
            .values({
              ip: msg.ip,
              reason: msg.reason ?? "Auto-blocked by agent",
              isActive: true,
              agentId: agentId,
            })
            .onConflictDoNothing({
              target: [blockedIps.ip, blockedIps.agentId],
            });
        }
      }

      if (msg.type === "unblock_ip_ack") {
        console.log("Unblock IP ACK from agent:", agentId, msg);

        if (msg.ok) {
          await db
            .update(blockedIps)
            .set({
              isActive: false,
            })
            .where(
              and(
                eq(blockedIps.ip, msg.ip),
                eq(blockedIps.agentId, agentId),
                eq(blockedIps.isActive, true),
              ),
            );
        }
      }
    } catch (err) {
      console.error("Invalid agent WS message", err);
    }
  });

  ws.on("close", () => {
    unregisterAgent(agentId);
    console.log("Agent disconnected:", agentId);
  });
}
