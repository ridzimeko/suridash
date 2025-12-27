import { WebSocketServer } from "ws";
import type { IncomingMessage } from "http";
import { handleAgentWS } from "./agent.js";
import { handleDashboardWS } from "./dashboard.js";

export function initWebSocket(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req: IncomingMessage) => {
    const url = req.url ?? "";

    if (url.startsWith("/ws/agent")) {
      handleAgentWS(ws, req);
      return;
    }

    if (url.startsWith("/ws/dashboard")) {
      handleDashboardWS(ws);
      return;
    }

    ws.close(1000, "Unknown WS endpoint");
  });
}
