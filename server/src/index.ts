import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import auth from "@/routes/auth";
import { alertsRoute } from './routes/alerts';
import type { AppEnv } from './types';
import { cors } from 'hono/cors';
import { analyticsRoute } from './routes/analytics';
import { integrationsRoute } from './routes/integrations';
import { systemRoute } from './routes/system';
import { realtimeAlertsRoute } from './routes/alerts-realtime';

const app = new Hono<AppEnv>({
  strict: false,
});

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

const routes = [auth, alertsRoute, analyticsRoute, integrationsRoute, systemRoute, realtimeAlertsRoute] as const;

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

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
