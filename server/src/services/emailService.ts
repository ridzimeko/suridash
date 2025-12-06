import { db } from "../db/index.js";
import { integrations } from "../db/schema/dashboard-schema.js";
import { eq } from "drizzle-orm";

type EmailParams = {
  to: string | string[];
  subject: string;
  html: string;
};

/**
 * Send email via Brevo API
 * @param to string | string[] — target email
 * @param subject string
 * @param html string — HTML content
 */
export async function sendEmailBrevo({ to, subject, html }: EmailParams, isTest = false) {
  // Ambil config integrasi dari database
  const [brevo] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.provider, "brevo"));

  if (!brevo?.enabled && !isTest) return;

  const cfg = brevo.config as { apiKey: string; fromEmail: string; fromName?: string };

  const payload = {
    sender: {
      email: cfg.fromEmail,
      name: cfg.fromName ?? "SuriDash",
    },
    to: Array.isArray(to) ? to.map((e) => ({ email: e })) : [{ email: to }],
    subject,
    htmlContent: html,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": cfg.apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return await res.json();
}
