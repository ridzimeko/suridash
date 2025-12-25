import time
from config import ALERT_BATCH_INTERVAL, ALERT_BATCH_SIZE
from ws_client import ws_send, alert_queue

def alert_batch_worker():
    batch = []
    last_send = time.time()

    while True:
        try:
            alert = alert_queue.get(timeout=1)
            batch.append(alert)
        except:
            pass

        if (
            len(batch) >= ALERT_BATCH_SIZE or
            (batch and time.time() - last_send >= ALERT_BATCH_INTERVAL)
        ):
            ws_send({
                "type": "suricata_batch",
                "payload": batch
            })
            batch.clear()
            last_send = time.time()
