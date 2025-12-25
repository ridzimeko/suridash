import psutil
import time

def get_system_stats():
    net1 = psutil.net_io_counters()
    time.sleep(1)
    net2 = psutil.net_io_counters()

    return {
        "type": "system",
        "cpu_percent": psutil.cpu_percent(interval=1),
        "ram_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage("/").percent,
        "network": {
            "bytes_sent_per_sec": net2.bytes_sent - net1.bytes_sent,
            "bytes_recv_per_sec": net2.bytes_recv - net1.bytes_recv,
        }
    }
