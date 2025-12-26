import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { agents } from "../db/schema/agents.js";
import { eq } from "drizzle-orm";

// service functions (anggap sudah ada)
import {
  createAgent,
  listAgents,
  getAgent,
  updateAgent,
  deleteAgent,
} from "../services/agentService.js";

const router = Router();

/* =========================
 * CREATE AGENT
 * ========================= */
router.post("/", async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Agent name is required" });
  }

  const result = await createAgent(name);
  return res.status(201).json(result);
});

/* =========================
 * INSTALL SCRIPT
 * ========================= */
router.get("/install.sh", (req: Request, res: Response) => {
  const baseUrl = process.env.APP_BASE_URL ?? "";

  const script = `#!/usr/bin/env bash
set -e

echo "🚀 Installing SuriDash Agent..."

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

mkdir -p $INSTALL_DIR
mkdir -p /etc/suridash-agent

if ! command -v curl >/dev/null; then
  apt update && apt install -y curl
fi

echo "⬇️ Downloading agent binary..."
curl -fsSL https://github.com/your-org/suridash-agent/releases/latest/download/suridash-agent-linux-amd64 -o $BIN_PATH
chmod +x $BIN_PATH

cat <<EOF > $CONFIG_PATH
AGENT_ID=$AGENT_ID
API_KEY=$API_KEY
SERVER_URL=${baseUrl}
EOF

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

  res.setHeader("Content-Type", "text/x-shellscript");
  return res.status(200).send(script);
});

/* =========================
 * HEARTBEAT
 * ========================= */
router.post("/heartbeat", async (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  const { agent_id } = req.body;

  if (!auth?.startsWith("Bearer ") || !agent_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const apiKey = auth.replace("Bearer ", "");

  const agent = await db.query.agents.findFirst({
    where: eq(agents.id, agent_id),
  });

  if (!agent || agent.apiKeyHash !== apiKey || !agent.isActive) {
    return res.status(403).json({ error: "Invalid agent" });
  }

  await db
    .update(agents)
    .set({
      status: "online",
      lastSeenAt: new Date(),
    })
    .where(eq(agents.id, agent.id));

  return res.json({ success: true });
});

/* =========================
 * READ ALL
 * ========================= */
router.get("/", async (_req: Request, res: Response) => {
  const data = await listAgents();
  return res.json(data);
});

/* =========================
 * READ ONE
 * ========================= */
router.get("/:id", async (req: Request, res: Response) => {
  const agent = await getAgent(req.params.id);

  if (!agent) {
    return res.status(404).json({ message: "Agent not found" });
  }

  return res.json(agent);
});

/* =========================
 * UPDATE
 * ========================= */
router.put("/:id", async (req: Request, res: Response) => {
  const updated = await updateAgent(req.params.id, req.body);

  if (!updated) {
    return res.status(404).json({ message: "Agent not found" });
  }

  return res.json(updated);
});

/* =========================
 * DELETE (SOFT)
 * ========================= */
router.delete("/:id", async (req: Request, res: Response) => {
  await deleteAgent(req.params.id);
  return res.status(204).send();
});

export default router;
