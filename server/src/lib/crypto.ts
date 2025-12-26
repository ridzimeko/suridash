import crypto from "crypto";

export function generateAgentId() {
  return `agt_${crypto.randomBytes(4).toString("hex")}`;
}

export function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashApiKey(apiKey: string) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}
