import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { alerts, blockedIps } from "../db/schema/dashboard-schema.js";
import { agents } from "../db/schema/agents.js";
import { notifyAll } from "./notificationService.js";

const notificationThrottle = new Map<string, number>();

export async function saveAlert(agentId: string, payload: any) {
  const blockPrivateIp = process.env.BLOCK_PRIVATE_IP === "true";
  // don't block private IPs
  const IP = payload.srcIp;
  const privateIpRanges = [
    /^10\./,
    /^100\.64\./,
    /^100\.100\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];

  if (blockPrivateIp && privateIpRanges.some((r) => r.test(IP))) {
    console.log("Skipping private IP alert:", IP);
    return;
  }

  const alert = {
    agentId: agentId,
    signature: payload.signature ?? "Unknown",
    category: payload.category ?? "Uncategorized",
    severity: payload.severity,
    srcIp: payload.srcIp,
    srcPort: payload.srcPort,
    destIp: payload.destIp,
    destPort: payload.destPort,
    protocol: payload.protocol,
    createdAt: new Date(payload.timestamp),

    signatureId: payload?.signatureId ?? null,
  };

  const [insertedAlert] = await db
    .insert(alerts)
    .values(alert)
    .returning();

  // Auto-block rules
  // if (IP && alert.severity <= 2) {
  const throttleKey = `${insertedAlert.signatureId}-${insertedAlert.srcIp}`;
  const lastNotified = notificationThrottle.get(throttleKey) || 0;
  const now = Date.now();
  const FIFTEEN_MINUTES = 15 * 60 * 1000;

  if ((now - lastNotified) > FIFTEEN_MINUTES) {
    console.log("Sending notifications for alert:", IP);
    notificationThrottle.set(throttleKey, now);
    
    notifyAll(alert).catch((e) => {
      console.error("Notification failed:", e);
    });
  }
  // }

  const [agent] = await db
    .select({ name: agents.name })
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  const agentName = agent?.name ?? "Unknown Agent";

  console.log("alert triggered:", alert.srcIp, "severity:", alert.severity, "signature:", alert.signature, "agent:", agentName);

  return { existing: false, alert: insertedAlert };
}
