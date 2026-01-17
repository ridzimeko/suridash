import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { agents } from "../db/schema/agents.js";
import { desc, eq, sql } from "drizzle-orm";
import { alerts as alertsTable, blockedIps as blockedIpsTable } from "../db/schema/dashboard-schema.js";

// service functions (anggap sudah ada)
import {
  createAgent,
  listAgents,
  getAgent,
  updateAgent,
  deleteAgent,
} from "../services/agentService.js";
import alerts from "./alerts.js";

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
set -euo pipefail

echo "🚀 Installing SuriDash Agent..."

AGENT_ID=""
API_KEY=""
SKIP_SETUP="false"

for arg in "$@"; do
  case $arg in
    --agent-id=*)
      AGENT_ID="\${arg#*=}"
      ;;
    --api-key=*)
      API_KEY="\${arg#*=}"
      ;;
    --skip-setup)
      SKIP_SETUP="true"
      ;;
  esac
done

if [ -z "$AGENT_ID" ] || [ -z "$API_KEY" ]; then
  echo "❌ Missing --agent-id or --api-key"
  echo "Usage: curl -fsSL ${baseUrl}/install.sh | sudo bash -s -- --agent-id=XXX --api-key=YYY"
  exit 1
fi

INSTALL_DIR="/etc/suridash-agent"
BIN_PATH="$INSTALL_DIR/suridash-agent"
CONFIG_PATH="$INSTALL_DIR/config.env"

mkdir -p "$INSTALL_DIR"

# Install curl (best-effort for common distros)
if ! command -v curl >/dev/null 2>&1; then
  if command -v apt >/dev/null 2>&1; then
    apt update -y && apt install -y curl
  elif command -v yum >/dev/null 2>&1; then
    yum install -y curl
  elif command -v apk >/dev/null 2>&1; then
    apk add curl
  else
    echo "❌ curl is required but package manager not found."
    exit 1
  fi
fi

ARCH="\$(uname -m)"
ASSET=""

case "$ARCH" in
  x86_64|amd64)
    ASSET="suridash-agent-linux-amd64.tar.gz"
    ;;
  aarch64|arm64)
    ASSET="suridash-agent-linux-arm64.tar.gz"
    ;;
  *)
    echo "❌ Unsupported architecture: $ARCH"
    echo "Supported: x86_64/amd64, aarch64/arm64"
    exit 1
    ;;
esac

REPO="ridzimeko/suridash-agent"
URL="https://github.com/$REPO/releases/latest/download/$ASSET"

TMP_TAR="\$(mktemp -t suridash-agent.XXXXXX.tar.gz)"

echo "⬇️ Downloading agent package: $ASSET"
curl -fsSL "$URL" -o "$TMP_TAR"

echo "📦 Extracting..."
tar -xzf "$TMP_TAR" -C "$INSTALL_DIR"
rm -f "$TMP_TAR"

# Tar berisi binary "suridash-agent"
if [ ! -f "$INSTALL_DIR/suridash-agent" ]; then
  echo "❌ Binary not found after extraction: $INSTALL_DIR/suridash-agent"
  exit 1
fi

chmod +x "$BIN_PATH"

cat <<EOF > "$CONFIG_PATH"
AGENT_ID=$AGENT_ID
API_KEY=$API_KEY
SERVER_URL=${baseUrl}
# Optional:
# SURIDASH_IPSET_NAME=suridash-blacklist
# SURIDASH_BLOCK_TIMEOUT=3600
EOF

# Optional: run setup firewall (ipset/iptables)
if [ "$SKIP_SETUP" != "true" ]; then
  echo "🧱 Running firewall setup (ipset/iptables)..."
  "$BIN_PATH" setup || {
    echo "⚠️ Setup failed. You can retry: sudo $BIN_PATH setup"
  }
else
  echo "ℹ️ Skipping setup (--skip-setup)"
fi

cat <<EOF > /etc/systemd/system/suridash-agent.service
[Unit]
Description=SuriDash Monitoring Agent
After=network.target

[Service]
Type=simple
ExecStart=$BIN_PATH run
EnvironmentFile=$CONFIG_PATH
Restart=always
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable suridash-agent
systemctl restart suridash-agent

echo ""
echo "✅ SuriDash Agent installed successfully!"
echo "➡️ Service status: systemctl status suridash-agent --no-pager"
echo "➡️ Logs: journalctl -u suridash-agent -f"
`;

  res.setHeader("Content-Type", "text/x-shellscript; charset=utf-8");
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

  if (!agent || agent.token !== apiKey || !agent.isActive) {
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

router.get("/:id/stats", async (req, res) => {
  const { id } = req.params;

  const totalAlerts = await db.select({ count: sql<number>`count(*)` })
    .from(alertsTable)
    .where(eq(alertsTable.agentId, id));

  const blockedIps = await db.select({ count: sql<number>`count(*)` })
    .from(blockedIpsTable)
    .where(eq(blockedIpsTable.agentId, id));

  res.json({
    totalAlerts: Number(totalAlerts[0]?.count ?? 0),
    blockedIps: Number(blockedIps[0]?.count ?? 0),
  });
});

router.get("/:id/alerts", async (req, res) => {
  const { id } = req.params;
  const limit = Number(req.query.limit ?? 5);

  const rows = await db
    .select({
      id: alertsTable.id,
      signature: alertsTable.signature,
      srcIp: alertsTable.srcIp,
      destIp: alertsTable.destIp,
      severity: alertsTable.severity,
      timestamp: alertsTable.createdAt,
    })
    .from(alertsTable)
    .where(eq(alertsTable.agentId, id))
    .orderBy(desc(alertsTable.createdAt))
    .limit(limit);

  res.json(rows);
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
