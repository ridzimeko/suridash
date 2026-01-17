import WebSocket from "ws";

export const agentSockets = new Map<string, WebSocket>();

export function registerAgent(agentId: string, ws: WebSocket) {
  agentSockets.set(agentId, ws);
}

export function unregisterAgent(agentId: string) {
  agentSockets.delete(agentId);
}

export function getAgentSocket(agentId: string): WebSocket | undefined {
  return agentSockets.get(agentId);
}
