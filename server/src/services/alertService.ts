import { and, eq, gte } from "drizzle-orm";
import { db } from "../db/index.js";
import { alerts, blockedIps } from "../db/schema/dashboard-schema.js";
import { fetchGeoIP } from "./geoipService.js";
import { blockIpAndRecord } from "./ipsetService.js";
import { notifyAll } from "./notificationService.js";

const DEDUP_WINDOW_MS = 60_000; // 1 menit

async function findSimilarAlert(agentId: string, alert: any) {
  const since = new Date(Date.now() - DEDUP_WINDOW_MS);

  const rows = await db
    .select()
    .from(alerts)
    .where(
      and(
        eq(alerts.agentId, agentId),
        eq(alerts.signatureId, alert.signatureId),
        eq(alerts.srcIp, alert.srcIp),
        eq(alerts.destIp, alert.destIp ?? ""),
        eq(alerts.protocol, alert.protocol),
        gte(alerts.createdAt, since)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function saveAlert(agentId: string, payload: any) {
  // don't block private IPs
  const IP = payload.srcIp;
  const privateIpRanges = [
    /^10\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];

  if (privateIpRanges.some((r) => r.test(IP))) {
    console.log("Skipping private IP alert:", IP);
    return;
  }

  const severityMap = {
    1: "critical",
    2: "high",
    3: "medium",
    4: "low",
  }

  const existing = await findSimilarAlert(agentId, payload);

  if (existing) {
    console.log("Duplicate alert detected, skipping:", payload.signature);
    return { existing: true, alert: existing };
  }

  const geo = await fetchGeoIP(payload.srcIp);

  const alert = {
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
    country: geo?.country ?? null,
    city: geo?.city ?? null,
    latitude: geo?.latitude ? geo.latitude.toString() : null,
    longitude: geo?.longitude ? geo.longitude.toString() : null,
    asNumber: geo?.asn ? geo.asn.toString() : null,
    asName: geo?.organization_name ?? null,
    wasBlocked: false,
  };

  // Auto-block rules
  if (IP && (alert.severity === 1 || alert.severity === 2)) {
    try {
      // block selama 60 menit misalnya
      // await blockIpAndRecord({
      //   ip: IP,
      //   reason: `Auto block for ${severityMap[alert.severity as keyof typeof severityMap] ?? 'unknown'}`,
      //   attackType: json.alert?.category,
      //   ttlMinutes: 60,
      //   autoBlocked: true,
      //   city: alert.city,
      //   country: alert.country,
      // });
      // alert.wasBlocked = true;
      // console.log(`Auto-blocked IP: ${IP}`);

      // Notify admins
      console.log("Sending notifications for alert:", IP);
      notifyAll(alert).catch((e) => {
        console.error("Notification failed:", e);
      });
    } catch (e) {
      console.error("Auto block failed:", e);
    }
  }

  console.log("alert triggered:", alert.srcIp, "severity:", alert.severity, "blocked:", alert.wasBlocked);

  await db.insert(alerts).values(alert);

  return { existing: false, alert };
}
