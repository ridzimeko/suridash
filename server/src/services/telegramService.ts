import { db } from "../db/index.js";
import { integrations } from "../db/schema/dashboard-schema.js";
import { eq } from "drizzle-orm";

type TelegramParams = {
  chat_id?: string;
  bot_token?: string;
  message: string;
};

export async function sendTelegram({ chat_id, bot_token, message }: TelegramParams, isTest = false) {
  const [tg] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.provider, "telegram"));

  if (!tg?.enabled && !isTest) return;

  const res = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text: message,
      parse_mode: "HTML",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}
