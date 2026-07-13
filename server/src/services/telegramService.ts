import { db } from "../db/index.js";
import { notifications } from "../db/schema/dashboard-schema.js";
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

export async function sendTelegram({ message, parse_mode = 'HTML', chat_id, bot_token }: TelegramParams, isTest = false) {
  let finalBotToken = bot_token;
  let finalChatId = chat_id;

  if (!finalBotToken || !finalChatId) {
    const [tg] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.provider, "telegram"));
    
    const config : TelegramConfig = tg?.config || {};

    if (!tg?.enabled && !isTest) return;
    
    if (!finalBotToken) finalBotToken = config.bot_token;
    if (!finalChatId) finalChatId = config.chat_id;
  }

  if (!finalBotToken) throw new Error("Telegram bot token not configured");

  const chatIds = finalChatId
    ? finalChatId.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  if (chatIds.length === 0) throw new Error("Telegram chat ID not configured");

  const results: PromiseSettledResult<any>[] = [];
  for (const chat_id of chatIds) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${finalBotToken}/sendMessage`, {
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
        results.push({ status: "rejected", reason: new Error(`Failed to send to ${chat_id}: ${err}`) });
      } else {
        results.push({ status: "fulfilled", chat_id, value: await res.json() } as any);
      }
    } catch (e: any) {
      results.push({ status: "rejected", reason: new Error(`Failed to send to ${chat_id}: ${e.message}`) });
    }
  }

  const errors = results
    .filter((r) => r.status === "rejected")
    .map((r: any) => r.reason.message);

  if (errors.length > 0) {
    console.error(`Telegram warning/error: ${errors.join(" | ")}`);
    
    // Jika semua pengiriman gagal, baru kita throw error
    if (errors.length === chatIds.length) {
      throw new Error(`Failed to send to all Telegram chats: ${errors.join(" | ")}`);
    }
  }

  const successfulChats = results
    .filter((r: any) => r.status === "fulfilled")
    .map((r: any) => r.chat_id);

  return { chatIds: successfulChats };
}
