import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { alerts, geoIP } from "../db/schema/dashboard-schema.js";
import { fetchGeoIP } from "./geoipService.js";
import { notifyAll } from "./notificationService.js";

export async function saveAlert(agentId: string, payload: any) {
  const blockPrivateIp = process.env.BLOCK_PRIVATE_IP === "true";
  // don't block private IPs
  const IP = payload.srcIp;
  const privateIpRanges = [
    /^10\./,
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

  // Check if geoip already exists for this IP
  let geoipId: number | null = null;
  
  const existingGeoIP = await db.query.geoIP.findFirst({
    where: (geoIP, { eq }) => eq(geoIP.ipAddress, payload.srcIp),
  });

  if (existingGeoIP) {
    // Use existing geoip record
    geoipId = existingGeoIP.id;
    console.log("Using existing GeoIP for:", payload.srcIp);
  } else {
    // Fetch new geoip data from API
    try {
      const geoData = await fetchGeoIP(payload.srcIp);
      
      // Insert new geoip record
      const [newGeoIP] = await db
        .insert(geoIP)
        .values({
          ipAddress: payload.srcIp,
          country: geoData.country,
          city: geoData.city,
          asName: geoData.asName,
          asNumber: geoData.asNumber,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
        })
        .onConflictDoNothing({
          target: [geoIP.ipAddress],
        })
        .returning();

      if (newGeoIP) {
        geoipId = newGeoIP.id;
        console.log("Created new GeoIP for:", payload.srcIp);
      } else {
        // Race condition: another request inserted it first
        const retryGeoIP = await db.query.geoIP.findFirst({
          where: (geoIP, { eq }) => eq(geoIP.ipAddress, payload.srcIp),
        });
        geoipId = retryGeoIP?.id ?? null;
      }
    } catch (e) {
      console.error("GeoIP fetch/insert failed:", e);
      // Continue without geoip data
    }
  }

  const alert = {
    signature: payload.signature ?? "Unknown",
    category: payload.category ?? "Uncategorized",
    severity: payload.severity,
    srcIp: payload.srcIp,
    srcPort: payload.srcPort,
    destIp: payload.destIp,
    destPort: payload.destPort,
    geoipId: geoipId,
    protocol: payload.protocol,
    createdAt: new Date(payload.timestamp),
    
    signatureId: payload?.signatureId ?? null,
  };

  // Auto-block rules
  if (IP && alert.severity <= 2) {
    try {
      // Notify admins
      console.log("Sending notifications for alert:", IP);
      notifyAll(alert).catch((e) => {
        console.error("Notification failed:", e);
      });
    } catch (e) {
      console.error("Auto block failed:", e);
    }
  }

  console.log(
    "alert triggered:",
    alert.srcIp,
    "severity:",
    alert.severity,
    "blocked:"
  );

  const [insertedAlert] = await db
    .insert(alerts)
    .values(alert)
    .onConflictDoUpdate({
      target: [
        alerts.signature,
        alerts.srcIp,
        alerts.srcPort,
        alerts.destIp,
        alerts.destPort,
        alerts.protocol,
      ],
      set: {
        alertCount: sql`${alerts.alertCount} + 1`,
        updatedAt: new Date(payload.timestamp),
      },
    })
    .returning();

  // If insertedAlert is undefined, it means conflict occurred (duplicate)
  if (!insertedAlert) {
    console.log("Duplicate alert skipped:", alert.srcIp);
    return { existing: true, alert: null };
  }

  return { existing: false, alert };
}
