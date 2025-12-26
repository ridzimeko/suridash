import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { integrations } from "../db/schema/dashboard-schema.js";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { sendEmailBrevo } from "../services/emailService.js";
import { sendTelegram } from "../services/telegramService.js";

const router = Router();

/* =========================
 * AUTH MIDDLEWARE
 * Semua route /integrations
 * ========================= */
router.use("/integrations", authMiddleware);

/* -------------------------------------------------
   GET /api/integrations
--------------------------------------------------- */
router.get("/integrations", async (_req: Request, res: Response) => {
  const result = await db
    .select()
    .from(integrations)
    .orderBy(desc(integrations.id));

  return res.json(result);
});

/* -------------------------------------------------
   GET /api/integrations/:id
--------------------------------------------------- */
router.get("/integrations/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const data = await db
    .select()
    .from(integrations)
    .where(eq(integrations.id, id));

  return res.json(data[0] ?? null);
});

/* -------------------------------------------------
   POST /api/integrations
--------------------------------------------------- */
router.post("/integrations", async (req: Request, res: Response) => {
  const body = req.body;

  if (!body?.provider || !body?.config) {
    return res.status(400).json({ error: "provider and config are required" });
  }

  const [inserted] = await db
    .insert(integrations)
    .values({
      provider: body.provider,
      config: body.config,
      enabled: body.enabled ?? true,
    })
    .returning();

  return res.status(201).json({ success: true, data: inserted });
});

/* -------------------------------------------------
   PUT /api/integrations/:id
--------------------------------------------------- */
router.put("/integrations/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const body = req.body;

  const updated = await db
    .update(integrations)
    .set({
      provider: body.provider,
      config: body.config,
      enabled: body.enabled,
      updatedAt: new Date(),
    })
    .where(eq(integrations.id, id))
    .returning();

  if (!updated.length) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.json({ success: true, data: updated[0] });
});

/* -------------------------------------------------
   DELETE /api/integrations/:id
--------------------------------------------------- */
router.delete("/integrations/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  await db.delete(integrations).where(eq(integrations.id, id));
  return res.json({ success: true });
});

/* -------------------------------------------------
   POST /api/integrations/test
--------------------------------------------------- */
router.post("/integrations/test", async (req: Request, res: Response) => {
  const { provider, config } = req.body;

  if (!provider || !config) {
    return res.status(400).json({ error: "provider and config required" });
  }

  if (provider === "brevo") {
    await sendEmailBrevo(
      {
        to: config.emailTo,
        subject: "Test Email from SuriDash",
        html: "<b>It's work! This is a test email sent from SuriDash.</b>",
      },
      true
    );

    return res.json({ message: "Test email sent!" });
  }

  if (provider === "telegram") {
    await sendTelegram(
      {
        message: "Test message from SuriDash via Telegram!",
      },
      true
    );

    return res.json({ message: "Test Telegram sent!" });
  }

  return res.status(400).json({ error: "Unknown provider" });
});

export default router;
