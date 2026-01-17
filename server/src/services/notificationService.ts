import { sendEmailBrevo } from "./emailService.js";
import { sendTelegram } from "./telegramService.js";
import { db } from "../db/index.js";
import { integrations } from "../db/schema/dashboard-schema.js";

export async function notifyAll(alert: any) {
    const configs = await db.select().from(integrations);
    if (!configs.length) return;

    const message = formatAlertMessage(alert);

    for (const { provider, config, enabled } of configs) {
        // send email
        // if (provider === "brevo" && enabled) {
        //     try {
        //         await sendEmailBrevo({
        //             to: (config as any).emailTo,
        //             subject: `[SuriDash] Alert: ${alert.severity}`,
        //             html: buildEmailTemplate(alert)
        //         });
        //         console.log("Email sent");
        //     } catch (e: any) {
        //         console.error("Email notification failed:", e.message);
        //     }
        // }

        // send telegram
        if (provider === "telegram" && enabled) {
            try {
                await sendTelegram({ message, parse_mode: 'Markdown' });
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

• Severity: *${alert.severity}*
• Signature: ${alert.signature}
• Category: ${alert.category}
• Source IP: ${alert.srcIp}
• Dest IP: ${alert.destIp}
• Country: ${alert.country ?? "-"}
• City: ${alert.city ?? "-"}

${alert.blocked ? "🔥 *Auto-blocked via IPSET!*" : ""}
`.trim();
}

function buildEmailTemplate(alert: any) {
    return `
  <h2>🚨 Suricata Alert</h2>
  <p><strong>Severity:</strong> ${alert.severity}</p>
  <p><strong>Signature:</strong> ${alert.signature}</p>
  <p><strong>Category:</strong> ${alert.category}</p>
  <p><strong>Source IP:</strong> ${alert.srcIp}</p>
  <p><strong>Country:</strong> ${alert.country ?? "-"}</p>
  <p><strong>City:</strong> ${alert.city ?? "-"}</p>
  ${alert.blocked ? "<p><strong style='color:red'>🔥 Auto-blocked via IPSET!</strong></p>" : ""}
`;
}
