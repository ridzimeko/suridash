import json
import time
import threading
import websocket
from queue import Queue

from config import WS_URL, API_KEY

alert_queue = Queue()
ws_instance = None


def ws_send(data):
    global ws_instance
    if ws_instance:
        ws_instance.send(json.dumps(data))


def on_open(ws):
    print("[WS] Connected")

    ws.send(json.dumps({
        "type": "auth",
        "api_key": API_KEY
    }))


def on_close(ws):
    print("[WS] Disconnected")


def on_error(ws, error):
    print("[WS] Error:", error)


def connect_ws():
    global ws_instance

    while True:
        try:
            ws_instance = websocket.WebSocketApp(
                WS_URL,
                on_open=on_open,
                on_close=lambda ws: on_close(ws),
                on_error=on_error,
            )
            ws_instance.run_forever(ping_interval=30, ping_timeout=10)
        except Exception as e:
            print("Reconnect failed:", e)

        time.sleep(5)
