import { WebSocket } from "ws";
import { broadcastToDashboard } from "./dashboard.js";
import { saveAlert } from "src/services/alertService.js";

export function handleAgentWS(ws: WebSocket, req: any) {
  const agentId = req.headers["x-agent-id"] as string;

  if (!agentId) {
    ws.close(1008, "Missing agent id");
    return;
  }

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

      if (msg.type === "ack") {
        console.log("ACK from agent:", agentId, msg);
      }
    } catch (err) {
      console.error("Invalid agent WS message", err);
    }
  });

  ws.on("close", () => {
    console.log("Agent disconnected:", agentId);
  });
}
