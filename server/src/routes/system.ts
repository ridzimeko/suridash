import { Hono } from "hono";
import { authMiddleware } from "@/middlewares/auth-middleware";
import type { AppEnv } from "../types";
import { suricataStatus, suricataRestart } from "../services/suricataService";
import si from "systeminformation";

export const systemRoute = new Hono<AppEnv>();

systemRoute.use("/system/*", authMiddleware);

/* GET status */
systemRoute.get("/system/suricata/status", async (c) => {
  try {
    const out = await suricataStatus();
    return c.json({ success: true, output: out });
  } catch (e) {
    return c.json({ success: false, error: e }, 500);
  }
});

/* RESTART */
systemRoute.post("/system/suricata/restart", async (c) => {
  try {
    await suricataRestart();
    return c.json({ success: true, message: "Suricata restarted" });
  } catch (e) {
    return c.json({ success: false, error: e }, 500);
  }
});

systemRoute.get("/system/stats", async (c) => {
  const cpuLoad = await si.currentLoad();
  const mem = await si.mem();
  const network = await si.networkStats();

  const totalGb = +(mem.total / 1024 / 1024 / 1024).toFixed(2);
  const usedGb = +(mem.active / 1024 / 1024 / 1024).toFixed(2);
  const freeGb = +(totalGb - usedGb).toFixed(2);

  const net = network[0]; // default interface

  return c.json({
    cpu: Math.round(cpuLoad.currentLoad),
    memory: Math.round((mem.active / mem.total) * 100),
    totalRam: totalGb,
    usedRam: usedGb,
    freeRam: freeGb,
    networkIn: parseFloat((net.rx_sec / 1024 / 1024).toFixed(2)),  // MB/s
    networkOut: parseFloat((net.tx_sec / 1024 / 1024).toFixed(2)), // MB/s
  });
});
