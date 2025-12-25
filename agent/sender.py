import requests
from config import API_URL, API_KEY

def send_payload(payload):
    try:
        requests.post(
            API_URL,
            json=payload,
            headers={
                "Authorization": f"Bearer {API_KEY}"
            },
            timeout=3
        )
    except Exception as e:
        print("Send error:", e)
