import { sendTelegram } from "./telegramService.js";
import { db } from "../db/index.js";
import { integrations } from "../db/schema/dashboard-schema.js";

export async function notifyAll(alert: any) {
  const configs = await db.select().from(integrations);
  if (!configs.length) return;

  const message = formatAlertMessage(alert);

  for (const { provider, config, enabled } of configs) {
    // send telegram
    if (provider === "telegram" && enabled) {
      try {
        await sendTelegram({ message, parse_mode: "Markdown" });
        console.log("Telegram sent");
      } catch (e: any) {
        console.error("Telegram notification failed:", e.message);
      }
    }
  }
}

function formatAlertMessage(alert: any) {
  return `
🚨 *Suricata Alert Detected*

Agent : ${alert.agent}

• Severity: *${alert.severity}*
• Signature: ${alert.signature}
• Category: ${alert.category}
• Source IP: ${alert.srcIp}
• Dest IP: ${alert.destIp}
• Dest Port: ${alert.destPort ?? "-"}
`.trim();
}
