import { db } from "@/db";
import { blockedIps } from "@/db/schema/dashboard-schema";
import { and, lt } from "drizzle-orm";
import { unblockIp } from "@/services/ipsetService";

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
        } catch (e) {
          console.error("Failed to auto-unblock", r.ip, e);
        }
      }
    } catch (e) {
      console.error("Scheduler error:", e);
    }
  }, intervalMs);
}
