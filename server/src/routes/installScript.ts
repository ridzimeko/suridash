export function getInstallScript(baseUrl: string): string {
  return `#!/usr/bin/env bash
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

WRITE_CONFIG="true"

if [ -f "$CONFIG_PATH" ]; then
  if command -v tty >/dev/null 2>&1 && [ -c "\$(tty)" ]; then
    read -p "⚠️  Config $CONFIG_PATH already exists. Replace it? (y/N): " -r < /dev/tty
    echo
    if [[ ! \$REPLY =~ ^[Yy]$ ]]; then
      WRITE_CONFIG="false"
      echo "⏭️  Skipping $CONFIG_PATH replacement."
    fi
  else
    echo "⚠️  Config $CONFIG_PATH already exists, replacing automatically (non-interactive)."
  fi
fi

if [ "\$WRITE_CONFIG" = "true" ]; then
  cat <<EOF > "$CONFIG_PATH"
AGENT_ID=$AGENT_ID
API_KEY=$API_KEY
SERVER_URL=${baseUrl}
# Optional:
# SURIDASH_IPSET_NAME=suridash-blacklist
# SURIDASH_BLOCK_TIMEOUT=3600

# Auto-block: otomatis blokir IP dari Suricata alert
SURIDASH_AUTO_BLOCK=false
SURIDASH_AUTO_BLOCK_SEVERITY=2
SURIDASH_AUTO_BLOCK_TIMEOUT=3600

# Konfigurasi Deduplikasi Alert
SURIDASH_DEDUP_BUCKET=20
SURIDASH_DEDUP_TTL=25

# Auto-block berdasarkan keyword serangan tertentu (pisahkan dengan koma)
# Contoh: sql injection, xss, dos, web application attack
SURIDASH_AUTO_BLOCK_KEYWORDS="sql injection,dos,xss,brute force"
EOF
fi

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
}
