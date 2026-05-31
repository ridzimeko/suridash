import { sendTelegram } from "./telegramService.js";
import { db } from "../db/index.js";
import { integrations } from "../db/schema/dashboard-schema.js";
import { agents } from "../db/schema/agents.js";
import { eq } from "drizzle-orm";

export async function notifyAll(alert: any) {
  const configs = await db.select().from(integrations);
  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.id, alert.agentId))
    .limit(1);
  if (!configs.length) return;

  const message = formatAlertMessage(alert, agent[0]);

  // Gunakan Map untuk memastikan setiap provider hanya dikirim sekali
  const uniqueConfigs = new Map();
  for (const config of configs) {
    if (config.enabled && !uniqueConfigs.has(config.provider)) {
      uniqueConfigs.set(config.provider, config);
    }
  }

  for (const { provider, config } of uniqueConfigs.values()) {
    // send telegram
    if (provider === "telegram") {
      try {
        await sendTelegram({ message, parse_mode: "Markdown" });
        console.log("Telegram sent");
      } catch (e: any) {
        console.error("Telegram notification failed:", e.message);
      }
    }
  }
}

function formatAlertMessage(alert: any, agent: any) {
  return `
🚨 *Suricata Alert Detected*

Agent : ${agent.name}

• Severity: *${alert.severity}*
• Signature: ${alert.signature}
• Category: ${alert.category}
• Source IP: ${alert.srcIp}
• Dest IP: ${alert.destIp}
• Dest Port: ${alert.destPort ?? "-"}
`.trim();
}
