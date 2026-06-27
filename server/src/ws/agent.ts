import { WebSocket } from "ws";
import { broadcastToDashboard } from "./dashboard.js";
import { saveAlert } from "../services/alertService.js";
import { registerAgent, unregisterAgent } from "../lib/wsRegistry.js";
import { blockedIps } from "../db/schema/dashboard-schema.js";
import { agents } from "../db/schema/agents.js";
import { db } from "../db/index.js";
import { eq, and } from "drizzle-orm";

export async function handleAgentWS(ws: WebSocket, req: any) {
  const agentId = req.headers["x-agent-id"] as string;

  if (!agentId) {
    ws.close(1008, "Missing agent id");
    return;
  }

  registerAgent(agentId, ws);

  try {
    const updatedAgent = await db
      .update(agents)
      .set({ status: "online", lastSeenAt: new Date() })
      .where(eq(agents.id, agentId))
      .returning();

    const agentName = updatedAgent[0]?.name || "Unknown";
    console.log(`Agent connected: ${agentName} (${agentId})`);

    broadcastToDashboard({
      agentId,
      type: "agent_connection_status",
      payload: { status: "online", lastSeenAt: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to update agent online status", err);
  }

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
          const existing = await db
            .select()
            .from(blockedIps)
            .where(
              and(
                eq(blockedIps.ip, msg.ip),
                eq(blockedIps.agentId, agentId),
                eq(blockedIps.reason, msg.reason)
              )
            );
            
          // Debounce: Ignore if the exact same IP was blocked within the last 60 seconds
          const isSpam = existing.some(
            (b) => new Date(b.createdAt).getTime() > Date.now() - 60000
          );

          if (!isSpam) {
            await db
              .insert(blockedIps)
              .values({
                ip: msg.ip,
                reason: msg.reason,
                agentId: agentId,
              });
          }
        }
      }
    } catch (err) {
      console.error("Invalid agent WS message", err);
    }
  });

  ws.on("close", async () => {
    unregisterAgent(agentId);

    try {
      const updatedAgent = await db
        .update(agents)
        .set({ status: "offline", lastSeenAt: new Date() })
        .where(eq(agents.id, agentId))
        .returning();

      const agentName = updatedAgent[0]?.name || "Unknown";
      console.log(`Agent disconnected: ${agentName} (${agentId})`);

      broadcastToDashboard({
        agentId,
        type: "agent_connection_status",
        payload: { status: "offline", lastSeenAt: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to update agent offline status", err);
    }
  });
}
