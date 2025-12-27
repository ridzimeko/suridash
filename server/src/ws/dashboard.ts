import { WebSocket } from "ws";

const dashboardSockets = new Set<WebSocket>();

export function handleDashboardWS(ws: WebSocket) {
  dashboardSockets.add(ws);
  console.log("Dashboard connected");

  ws.on("close", () => {
    dashboardSockets.delete(ws);
    console.log("Dashboard disconnected");
  });
}

export function broadcastToDashboard(payload: any) {
  const data = JSON.stringify(payload);

  for (const ws of dashboardSockets) {
    try {
      ws.send(data);
    } catch {
      dashboardSockets.delete(ws);
    }
  }
}
