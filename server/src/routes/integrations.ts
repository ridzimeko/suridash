import { Hono } from "hono";
import type { AppEnv } from "../types/index.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { db } from "../db/index.js";
import { integrations } from "../db/schema/dashboard-schema.js";
import { eq, desc } from "drizzle-orm";
import { sendEmailBrevo } from "../services/emailService.js";
import { sendTelegram } from "../services/telegramService.js";

export const integrationsRoute = new Hono<AppEnv>();

// protect semua endpoint
integrationsRoute.use("/integrations/*", authMiddleware);

// GET list integrasi
integrationsRoute.get("/integrations", async (c) => {
  const result = await db.select().from(integrations).orderBy(desc(integrations.id));
  return c.json(result);
});

// GET detail
integrationsRoute.get("/integrations/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const data = await db.select().from(integrations).where(eq(integrations.id, id));
  return c.json(data[0] ?? null);
});

// CREATE
integrationsRoute.post("/integrations", async (c) => {
  const body = await c.req.json();
  const inserted = await db
    .insert(integrations)
    .values({
      provider: body.provider,
      config: body.config,
      enabled: body.enabled ?? true,
    })
    .returning();
  return c.json({ success: true, data: inserted[0] });
});

// UPDATE
integrationsRoute.put("/integrations/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  const updated = await db
    .update(integrations)
    .set({
      provider: body.provider,
      config: body.config,
      enabled: body.enabled,
    })
    .where(eq(integrations.id, id))
    .returning();

  return c.json({ success: true, data: updated[0] });
});

// DELETE
integrationsRoute.delete("/integrations/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(integrations).where(eq(integrations.id, id));
  return c.json({ success: true });
});

integrationsRoute.post("/integrations/test", async (c) => {
  const { provider, config } = await c.req.json();

  if (provider === "brevo") {
    await sendEmailBrevo({
      to: config.emailTo, 
      subject: "Test Email from SuriDash", 
      html: "<b>It's work! This is a test email sent from SuriDash.</b>"
    }, true);
    return c.json({ message: "Test email sent!" });
  }

  if (provider === "telegram") {
    await sendTelegram({
      message: "Test message from SuriDash via Telegram!",
    }, true);
    return c.json({ message: "Test Telegram sent!" });
  }

  return c.json({ error: "Unknown provider" }, 400);
});

