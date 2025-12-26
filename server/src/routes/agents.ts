import { Hono } from "hono";
import {
  createAgent,
  listAgents,
  getAgent,
  updateAgent,
  deleteAgent,
} from "../services/agentService.js";
import type { AppEnv } from "src/types/index.js";
import { db } from "src/db/index.js";
import { eq } from "drizzle-orm";
import { agents } from "src/db/schema/agents.js";

export const agentsRoute = new Hono<AppEnv>();

// CREATE
agentsRoute.post("/agents", async (c) => {
  const { name } = await c.req.json();

  if (!name) {
    return c.json({ message: "Agent name is required" }, 400);
  }

  const result = await createAgent(name);
  return c.json(result, 201);
});

agentsRoute.get("agents/install.sh", (c) => {
  const baseUrl = process.env.APP_BASE_URL ?? '';
  
  const script = `#!/usr/bin/env bash
set -e

echo "🚀 Installing SuriDash Agent..."

# ======================
# PARSE ARGUMENTS
# ======================
for arg in "$@"; do
  case $arg in
    --agent-id=*)
      AGENT_ID="\${arg#*=}"
      ;;
    --api-key=*)
      API_KEY="\${arg#*=}"
      ;;
  esac
done

if [ -z "$AGENT_ID" ] || [ -z "$API_KEY" ]; then
  echo "❌ Missing --agent-id or --api-key"
  exit 1
fi

INSTALL_DIR="/opt/suridash-agent"
BIN_PATH="$INSTALL_DIR/agent"
CONFIG_PATH="/etc/suridash-agent/config.env"

echo "📁 Creating directories..."
mkdir -p $INSTALL_DIR
mkdir -p /etc/suridash-agent

# ======================
# DEPENDENCIES
# ======================
if ! command -v curl >/dev/null; then
  apt update && apt install -y curl
fi

# ======================
# DOWNLOAD AGENT
# ======================
echo "⬇️ Downloading agent binary..."
curl -fsSL https://suridash.local/agent/agent-linux-amd64 -o $BIN_PATH
chmod +x $BIN_PATH

# ======================
# CONFIG
# ======================
echo "⚙️ Writing config..."
cat <<EOF > $CONFIG_PATH
AGENT_ID=$AGENT_ID
API_KEY=$API_KEY
SERVER_URL=${baseUrl}
EOF

# ======================
# SYSTEMD
# ======================
echo "🔧 Installing systemd service..."

cat <<EOF > /etc/systemd/system/suridash-agent.service
[Unit]
Description=SuriDash Monitoring Agent
After=network.target

[Service]
ExecStart=$BIN_PATH
EnvironmentFile=$CONFIG_PATH
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable suridash-agent
systemctl restart suridash-agent

echo "✅ SuriDash Agent installed successfully!"
`;

  return c.text(script, 200, {
    "Content-Type": "text/x-shellscript",
  });
});

agentsRoute.post("/agents/heartbeat", async (c) => {
  // 🔐 API KEY dari header
  const auth = c.req.header("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const apiKey = auth.replace("Bearer ", "");

  const body = await c.req.json<{ agent_id: string }>();
  if (!body?.agent_id) {
    return c.json({ error: "agent_id required" }, 400);
  }

  // 🔍 cari agent
  const agent = await db.query.agents.findFirst({
    where: eq(agents.id, body.agent_id),
  });

  if (!agent || agent.apiKeyHash !== apiKey || !agent.isActive) {
    return c.json({ error: "Invalid agent" }, 403);
  }

  // ✅ update heartbeat
  await db
    .update(agents)
    .set({
      status: "online",
      lastSeenAt: new Date(),
    })
    .where(eq(agents.id, agent.id));

  return c.json({ success: true });
});


// READ ALL
agentsRoute.get("/agents", async (c) => {
  const data = await listAgents();
  return c.json(data);
});

// READ ONE
agentsRoute.get("/agents/:id", async (c) => {
  const agent = await getAgent(c.req.param("id"));

  if (!agent) {
    return c.json({ message: "Agent not found" }, 404);
  }

  return c.json(agent);
});

// UPDATE
agentsRoute.put("/agents/:id", async (c) => {
  const updated = await updateAgent(c.req.param("id"), await c.req.json());

  if (!updated) {
    return c.json({ message: "Agent not found" }, 404);
  }

  return c.json(updated);
});

// DELETE (SOFT)
agentsRoute.delete("/agents/:id", async (c) => {
  await deleteAgent(c.req.param("id"));
  return c.body(null, 204);
});