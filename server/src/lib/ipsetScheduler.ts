import { db } from "../db/index.js";
import { blockedIps } from "../db/schema/dashboard-schema.js";
import { and, lt } from "drizzle-orm";
import { unblockIp } from "../services/ipsetService.js";

export function startIpsetScheduler(intervalMs = 60_000) {
  // run periodically
  setInterval(async () => {
    try {
      const now = new Date();
      const rows = await db.select().from(blockedIps).where(and(lt(blockedIps.blockedUntil, now), blockedIps.isActive));
      for (const r of rows) {
        try {
          await unblockIp({ id: r.id });
          console.log("Auto-unblocked:", r.ip);
        } catch (e: any) {
          console.error("Failed to auto-unblock", r.ip, e.message);
        }
      }
    } catch (e: any) {
      console.error("Scheduler error:", e.message);
    }
  }, intervalMs);
}
