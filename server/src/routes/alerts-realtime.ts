import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import { Tail } from "tail";

export const realtimeAlertsRoute = new Hono();

// Initialize WebSocket
const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app: realtimeAlertsRoute });

// WebSocket endpoint
realtimeAlertsRoute.get(
  "/ws/alerts/realtime",
  upgradeWebSocket((c) => {
    return {
      onMessage(evt, ws) {
        console.log("Client connected to Suricata alerts");

        const tail = new Tail("/var/log/suricata/eve.json", {
          follow: true,
          useWatchFile: true,
        });

        tail.on("line", (line) => {
          try {
            const json = JSON.parse(line);

            if (json.event_type === "alert") {
              ws.send(JSON.stringify(json));
            }
          } catch (err) {
            console.error("Failed to parse alert JSON:", err);
          }
        });

        tail.on("error", (err) => console.error("Tail error:", err));
      },

      onClose() {
        console.log("Client disconnected");
      },
    };
  })
);
