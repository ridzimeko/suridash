import { db } from "@/db";
import { integrations } from "@/db/schema/dashboard-schema";
import { eq } from "drizzle-orm";

export async function sendTelegram(message: string) {
  const [tg] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.provider, "telegram"));

  if (!tg?.enabled) return;

  const { bot_token, chat_id } = tg.config as { bot_token: string; chat_id: string };

  await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text: message,
      parse_mode: "HTML",
    }),
  });
}
