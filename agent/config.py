import os
from dotenv import load_dotenv

load_dotenv()

WS_URL = os.getenv("WS_URL", "ws://localhost:8000/ws/agent")
API_KEY = os.getenv("API_KEY", "SECRET_KEY")

SURICATA_LOG = os.getenv("SURICATA_LOG", "/var/log/suricata/eve.json")

SYSTEM_INTERVAL = int(os.getenv("SYSTEM_INTERVAL", 5))   # detik
ALERT_BATCH_INTERVAL = int(os.getenv("ALERT_BATCH_INTERVAL", 5))
ALERT_BATCH_SIZE = int(os.getenv("ALERT_BATCH_SIZE", 20))
