import { sendTelegram } from "./telegramService.js";
import { db } from "../db/index.js";
import { notifications } from "../db/schema/dashboard-schema.js";
import { agents } from "../db/schema/agents.js";
import { eq } from "drizzle-orm";

export async function notifyAll(alert: any) {
  const configs = await db.select().from(notifications);
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
        const res = await sendTelegram({ message, parse_mode: "Markdown" });
        if (res?.chatIds?.length) {
          console.log(`Telegram sent to: ${res.chatIds.join(", ")}`);
        }
      } catch (e: any) {
        console.error("Telegram notification failed:", e.message);
      }
    }
  }
}

function escapeMarkdown(text: any): string {
  if (text === null || text === undefined) return "-";
  return String(text).replace(/([_*\[`])/g, '\\$1');
}

function formatAlertMessage(alert: any, agent: any) {
  return `
🚨 *Suricata Alert Detected*

Agent : ${escapeMarkdown(agent.name)}

• Severity: *${escapeMarkdown(alert.severity)}*
• Signature: ${escapeMarkdown(alert.signature)}
• Category: ${escapeMarkdown(alert.category)}
• Source IP: ${escapeMarkdown(alert.srcIp)}
• Dest IP: ${escapeMarkdown(alert.destIp)}
• Dest Port: ${escapeMarkdown(alert.destPort)}
`.trim();
}
