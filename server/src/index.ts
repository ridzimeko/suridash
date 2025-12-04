import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import auth from "@/routes/auth";
import { alertsRoute } from './routes/alerts';
import type { AppEnv } from './types';
import { cors } from 'hono/cors';
import { analyticsRoute } from './routes/analytics';
import { integrationsRoute } from './routes/integrations';
import { systemRoute } from './routes/system';
import { createNodeWebSocket } from '@hono/node-ws';
import { Tail } from 'tail';

const app = new Hono<AppEnv>({
  strict: false,
});

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

const routes = [auth, alertsRoute, analyticsRoute, integrationsRoute, systemRoute] as const;

app.use(
  "/api/*",
  cors({
    origin: process.env.ORIGIN_URL!, // replace with your origin
    credentials: true,
  })
);

routes.forEach((route) => {
  app.route("/api", route);
});

// Initialize WebSocket
const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app: app });

// WebSocket endpoint
app.get(
  "/ws/alerts/realtime",
  upgradeWebSocket((c) => {
    return {
      onOpen(evt, ws) {
        console.log("Client connected to Suricata alerts");

        const tail = new Tail("/var/log/suricata/eve.json", {
          follow: true,
          useWatchFile: true,
          fromBeginning: false,
        });

        tail.on("line", (line) => {
          try {
            const json = JSON.parse(line);
            console.log("New line from eve.json:", json);

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


const server = serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
injectWebSocket(server);
