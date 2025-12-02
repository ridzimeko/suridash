import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import auth from "@/routes/auth";
import type { AuthType } from './lib/auth';

const app = new Hono<{ Variables: AuthType }>({
  strict: false,
});

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

const routes = [auth] as const;

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
