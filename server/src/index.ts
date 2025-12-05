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
import { startAlertTailer } from "@/lib/alertTailer";
import { startIpsetScheduler } from './lib/ipsetScheduler';

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
        // TODO: add to clients websocket
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
startAlertTailer();
startIpsetScheduler();