import { getAgentSocket } from "../lib/wsRegistry.js";

type BlockPayload = {
  agentId: string;
  ip: string;
  duration?: number;
  severity: number;
  reason?: string;
  alertId?: string;
};

export function sendBlockIp({
  agentId,
  ip,
  duration = 3600,
  severity,
  reason = "auto-block severity<=2",
  alertId,
}: BlockPayload) {
  // double-check di server
  if (severity > 2) return false;

  const ws = getAgentSocket(agentId);
  if (!ws || ws.readyState !== ws.OPEN) {
    console.warn("Agent not connected:", agentId);
    return false;
  }

  const payload = {
    type: "block_ip",
    ip,
    duration,
    severity,
    reason,
    alertId,
    timestamp: Date.now(),
  };

  ws.send(JSON.stringify(payload));
  return true;
}

export function sendUnblockIp(agentId: string | null, ip: string) {
  if (!agentId) return false;

  const ws = getAgentSocket(agentId);
  if (!ws || ws.readyState !== ws.OPEN) {
    console.warn("Agent not connected:", agentId);
    return false;
  }

  const payload = {
    type: "unblock_ip",
    ip,
    timestamp: Date.now(),
  };

  ws.send(JSON.stringify(payload));
  return true;
}
