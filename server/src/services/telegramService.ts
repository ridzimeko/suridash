import { db } from "../db/index.js";
import { integrations } from "../db/schema/dashboard-schema.js";
import { eq } from "drizzle-orm";

type TelegramParams = {
  chat_id?: string;
  bot_token?: string;
  parse_mode?: string;
  message: string;
};

type TelegramConfig = {
  bot_token?: string;
  chat_id?: string;
};

export async function sendTelegram({ message, parse_mode = 'HTML' }: TelegramParams, isTest = false) {
  const [tg] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.provider, "telegram"));
  
  const config : TelegramConfig = tg?.config || {};

  if (!tg?.enabled && !isTest) return;
  const bot_token = config.bot_token;
  if (!bot_token) throw new Error("Telegram bot token not configured");

  const chatIds = config.chat_id
    ? config.chat_id.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  if (chatIds.length === 0) throw new Error("Telegram chat ID not configured");

  const results = await Promise.allSettled(
    chatIds.map(async (chat_id) => {
      const res = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id,
          text: message,
          parse_mode,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to send to ${chat_id}: ${err}`);
      }
    })
  );

  const errors = results
    .filter((r) => r.status === "rejected")
    .map((r: any) => r.reason.message);

  if (errors.length > 0) {
    throw new Error(`Telegram error(s): ${errors.join(" | ")}`);
  }
}
