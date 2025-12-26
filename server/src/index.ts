import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import auth from "./routes/auth.js";
import { alertsRoute } from './routes/alerts.js';
import type { AppEnv } from './types/index.js';
import { cors } from 'hono/cors';
import { analyticsRoute } from './routes/analytics.js';
import { integrationsRoute } from './routes/integrations.js';
import { systemRoute } from './routes/system.js';
import { createNodeWebSocket } from '@hono/node-ws';
import { startAlertTailer } from "./lib/alertTailer.js";
import { startIpsetScheduler } from './lib/ipsetScheduler.js';
import { blockedRoute } from './routes/blocked-ips.js';
import { agentsRoute } from './routes/agents.js';
import { heartbeatRoute } from './routes/agent-heartbeat.js';
import { agentWs } from './routes/ws/agent.js';

const app = new Hono<AppEnv>({
  strict: false,
});

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

const routes = [auth, alertsRoute, analyticsRoute, integrationsRoute, systemRoute, blockedRoute, agentsRoute, heartbeatRoute] as const;

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

const agentSockets = new Map();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

// WebSocket endpoint
app.get(
  "/ws/agent",
  upgradeWebSocket((c) => {
    const agentId = c.req.header("x-agent-id");

    if (!agentId) {
      throw new Error("Missing agent id");
    }

    console.log(agentId)

    return {
      onOpen(_, ws) {
        agentSockets.set(agentId, ws);
        console.log(`Agent connected: ${agentId}`);
      },

      onClose() {
        agentSockets.delete(agentId);
        console.log(`Agent disconnected: ${agentId}`);
      },
    };
  })
);

export function sendCommandToAgent(
  agentId: string,
  payload: any
) {
  const ws = agentSockets.get(agentId);
  if (!ws) return false;

  ws.send(JSON.stringify(payload));
  return true;
}


const server = serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

injectWebSocket(server);
startAlertTailer();
startIpsetScheduler();