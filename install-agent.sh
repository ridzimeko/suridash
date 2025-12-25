#!/bin/bash
set -e

# ===============================
# Detect root project directory
# ===============================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
AGENT_SRC="$ROOT_DIR/agent"
APP_DIR="/opt/suridash-agent"
SERVICE_NAME="suridash-agent"

echo "▶ Installing WebSocket Agent..."
echo "▶ Agent source: $AGENT_SRC"

# ===============================
# Validate agent folder
# ===============================
if [ ! -d "$AGENT_SRC/src" ]; then
  echo "❌ Folder agent/src tidak ditemukan"
  exit 1
fi

# ===============================
# Install dependency OS
# ===============================
apt update
apt install -y python3 python3-pip

# ===============================
# Copy agent files
# ===============================
mkdir -p $APP_DIR
cp -r $AGENT_SRC/src $APP_DIR/
cp $AGENT_SRC/requirements.txt $APP_DIR/

# Copy config if exists
if [ ! -f "$APP_DIR/.env" ]; then
  cp $AGENT_SRC/.env.example $APP_DIR/.env
  echo "⚠️  .env dibuat dari .env.example (harap edit)"
fi

# ===============================
# Install Python dependency
# ===============================
pip3 install -r $APP_DIR/requirements.txt

# ===============================
# systemd service
# ===============================
cat <<EOF >/etc/systemd/system/$SERVICE_NAME.service
[Unit]
Description=WebSocket Monitoring Agent
After=network.target

[Service]
ExecStart=/usr/bin/python3 $APP_DIR/src/main.py
Restart=always
EnvironmentFile=$APP_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

# ===============================
# Permission & start
# ===============================
chmod 600 $APP_DIR/.env
systemctl daemon-reexec
systemctl enable $SERVICE_NAME
systemctl restart $SERVICE_NAME

echo "✅ Agent installed & running"
