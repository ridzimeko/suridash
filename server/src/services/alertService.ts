import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { alerts, blockedIps } from "../db/schema/dashboard-schema.js";
import { fetchGeoIP } from "./geoipService.js";
import { blockIpAndRecord } from "./ipsetService.js";
import { notifyAll } from "./notificationService.js";

export async function saveAlert(json: any) {
  // don't block private IPs
  const IP = json.src_ip;
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

  const geo = await fetchGeoIP(json.src_ip);

  function getASN(orgString: string) {
    const match = orgString.match(/(AS\d+)/i);
    return match ? match[1] : null;
  }

  function getASName(orgString: string) {
    const match = orgString.match(/AS\d+\s+(.*)/i);
    return match ? match[1] : null;
  }

  const alert = {
    signature: json.alert?.signature ?? "Unknown",
    category: json.alert?.category ?? "Uncategorized",
    severity: json.alert?.severity,
    srcIp: json.src_ip,
    srcPort: json.src_port,
    destIp: json.dest_ip,
    destPort: json.dest_port,
    protocol: json.proto,
    createdAt: new Date(json.timestamp),
    signatureId: json.alert?.signature_id ?? null,
    country: geo?.country ?? null,
    city: geo?.city ?? null,
    latitude: geo?.latitude ? geo.latitude.toString() : null,
    longitude: geo?.longitude ? geo.longitude.toString() : null,
    as_number: getASN(geo?.org),
    as_name: getASName(geo?.org),
    wasBlocked: false,
  };

  // Auto-block rules
  if (IP && (alert.severity === 1 || alert.severity === 2)) {
    try {
      const existingBlock = await db
        .select()
        .from(blockedIps)
        .where((b) => eq(b.ip, IP))
        .limit(1);

      if (existingBlock.length > 0) {
        const updateCount = await db
          .update(blockedIps)
          .set({
            alertCount: existingBlock[0].alertCount + 1,
          })
          .where(eq(blockedIps.ip, IP));
        console.log(`Updated ${updateCount} existing block record(s) for IP:`, IP);
        return;
      }

      // block selama 60 menit misalnya
      await blockIpAndRecord({
        ip: IP,
        reason: `Auto block for ${severityMap[alert.severity as keyof typeof severityMap] ?? 'unknown'}`,
        attackType: json.alert?.category,
        ttlMinutes: 60,
        autoBlocked: true,
        city: alert.city,
        country: alert.country,
      });
      alert.wasBlocked = true;
      console.log(`Auto-blocked IP: ${IP}`);
    } catch (e) {
      console.error("Auto block failed:", e);
    }

    console.log("Sending notifications for alert:", IP);
    notifyAll(alert).catch((e) => {
      console.error("Notification failed:", e);
    });
  }

  console.log("alert triggered:", alert.srcIp, "severity:", alert.severity, "blocked:", alert.wasBlocked);

  await db.insert(alerts).values(alert);
}
