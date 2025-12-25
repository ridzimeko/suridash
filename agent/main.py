import threading
import time

from suricata.watcher import follow_eve_log
from suricata.parser import parse_alert
from system.monitor import get_system_stats
from ws_client import connect_ws, ws_send, alert_queue
from utils import alert_batch_worker
from config import SURICATA_LOG, SYSTEM_INTERVAL


def suricata_worker():
    for event in follow_eve_log(SURICATA_LOG):
        alert = parse_alert(event)
        if alert:
            alert_queue.put(alert)


def system_worker():
    while True:
        ws_send({
            "type": "system",
            "payload": get_system_stats()
        })
        time.sleep(SYSTEM_INTERVAL)


if __name__ == "__main__":
    threads = [
        threading.Thread(target=connect_ws, daemon=True),
        threading.Thread(target=suricata_worker, daemon=True),
        threading.Thread(target=system_worker, daemon=True),
        threading.Thread(target=alert_batch_worker, daemon=True),
    ]

    for t in threads:
        t.start()

    while True:
        time.sleep(1)
