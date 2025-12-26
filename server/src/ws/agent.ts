import { WebSocketServer, WebSocket } from "ws";

const agentSockets = new Map<string, WebSocket>();

export function initAgentWs(wss: WebSocketServer) {
  wss.on("connection", (ws, req) => {
    const agentId = req.headers["x-agent-id"] as string;

    if (!agentId) {
      ws.close(1008, "Missing agent id");
      return;
    }

    agentSockets.set(agentId, ws);
    console.log("Agent connected:", agentId);

    ws.on("close", () => {
      agentSockets.delete(agentId);
      console.log("Agent disconnected:", agentId);
    });

    ws.on("message", (msg) => {
      console.log("Message from", agentId, msg.toString());
    });
  });
}

export function sendCommandToAgent(agentId: string, payload: any) {
  const ws = agentSockets.get(agentId);
  if (!ws) return false;

  ws.send(JSON.stringify(payload));
  return true;
}
