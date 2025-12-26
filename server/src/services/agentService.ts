import { db } from "../db/index.js"
import { agents } from "../db/schema/agents.js"
import { eq } from "drizzle-orm"
import {
  generateAgentId,
  generateApiKey,
  hashApiKey,
} from "../lib/crypto.js"

export async function createAgent(name: string) {
  const id = generateAgentId()
  const apiKey = generateApiKey()
  const baseUrl = process.env.APP_BASE_URL ?? '';

  await db.insert(agents).values({
    id,
    name,
    apiKeyHash: hashApiKey(apiKey),
  })

  return {
    id,
    apiKey, // ⚠️ hanya dikirim sekali
    installCommand: `curl -fsSL ${baseUrl}/api/agents/install.sh | sudo bash -s -- --agent-id=${id} --api-key=${apiKey}`,
  }
}

export async function listAgents() {
  return db
    .select({
      id: agents.id,
      name: agents.name,
      status: agents.status,
      lastSeenAt: agents.lastSeenAt,
      createdAt: agents.createdAt,
    })
    .from(agents)
    .where(eq(agents.isActive, true))
}

export async function getAgent(id: string) {
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.id, id))

  return agent
}

export async function updateAgent(
  id: string,
  data: { name?: string }
) {
  const [updated] = await db
    .update(agents)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, id))
    .returning()

  return updated
}

export async function deleteAgent(id: string) {
  await db
    .update(agents)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, id))
}
