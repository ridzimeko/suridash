import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { alerts, blockedIps } from "../db/schema/dashboard-schema.js";
import { notifyAll } from "./notificationService.js";

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
    .onConflictDoUpdate({
      target: [
        alerts.signatureId, // SID sebagai identifier utama
        alerts.srcIp,
        alerts.destIp,
        alerts.protocol,
      ],
      set: {
        // Update signature dan category dari rules terbaru
        signature: payload.signature ?? "Unknown",
        category: payload.category ?? "Uncategorized",
        severity: payload.severity, // Update severity juga jika berubah
        srcPort: payload.srcPort, // Perbarui ke port terakhir
        destPort: payload.destPort, // Perbarui ke port terakhir
        alertCount: sql`${alerts.alertCount} + 1`,
        updatedAt: new Date(payload.timestamp),
      },
    })
    .returning();

  // Auto-block rules
  // if (IP && alert.severity <= 2) {
  if (insertedAlert.alertCount === 1 || insertedAlert.alertCount % 10 === 0) {
    console.log("Sending notifications for alert:", IP);
    notifyAll(alert).catch((e) => {
      console.error("Notification failed:", e);
    });
  }
  // }

  console.log("alert triggered:", alert.srcIp, "severity:", alert.severity);

  // If insertedAlert is undefined, it means conflict occurred (duplicate)
  if (!insertedAlert) {
    console.log("Duplicate alert skipped:", alert.srcIp);
    return { existing: true, alert: null };
  }

  return { existing: false, alert };
}
