import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import auth from "@/routes/auth";
import { alertsRoute } from './routes/alerts';
import type { AppEnv } from './types';

const app = new Hono<AppEnv>({
  strict: false,
});

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

const routes = [auth, alertsRoute] as const;

routes.forEach((route) => {
  app.route("/api", route);
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
