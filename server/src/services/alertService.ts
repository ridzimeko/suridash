import { db } from "@/db";
import { alerts } from "@/db/schema/dashboard-schema";
import { fetchGeoIP } from "./geoipService";
import { blockIpAndRecord } from "./ipsetService";
import { notifyAll } from "./notificationService";

export async function saveAlert(json: any) {

  // don't block private IPs
  const IP = json.src_ip;
  const privateIpRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
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

  const sev = (json.alert?.severity || "low").toLowerCase();
  const geo = await fetchGeoIP(json.src_ip);

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
    wasBlocked: false,
  };

   // Auto-block rules
  if (IP && (sev === "critical" || sev === "high")) {
    try {
      // block selama 60 menit misalnya
      await blockIpAndRecord({ ip: IP, reason: `Auto block for ${sev}`, attackType: json.alert?.category, ttlMinutes: 60, autoBlocked: true });
      alert.wasBlocked = true;
    } catch (e) {
      console.error("Auto block failed:", e);
    }
  }

  if (alert.severity === 1 || alert.severity === 2) {
    notifyAll(alert).catch((e) => {
      console.error("Notification failed:", e);
    }
  }

  await db.insert(alerts).values(alert);
}
