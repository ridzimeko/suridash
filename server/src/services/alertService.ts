import { db } from "@/db";
import { alerts } from "@/db/schema/dashboard-schema";
import { fetchGeoIP } from "./geoipService";
import { nanoid } from "better-auth";

export async function saveAlert(json: any) {
  const geo = await fetchGeoIP(json.src_ip);

  await db.insert(alerts).values({
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
  });
}
