def parse_alert(event):
    if event.get("event_type") != "alert":
        return None

    alert = event["alert"]

    return {
        "type": "suricata",
        "timestamp": event.get("timestamp"),
        "src_ip": event.get("src_ip"),
        "src_port": event.get("src_port"),
        "dest_ip": event.get("dest_ip"),
        "dest_port": event.get("dest_port"),
        "signature": alert.get("signature"),
        "category": alert.get("category"),
        "severity": alert.get("severity"),
        "protocol": event.get("proto")
    }
