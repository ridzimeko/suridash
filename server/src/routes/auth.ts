import { Hono } from 'hono'
import { auth } from '../lib/auth'
import type { AuthType } from '../lib/auth'
import { cors } from 'hono/cors';

const router = new Hono<{ Bindings: AuthType; Variables: { user: any } }>({
  strict: false,
})

router.use(
	"/auth/*", // or replace with "*" to enable cors for all routes
	cors({
		origin: process.env.BETTER_AUTH_URL as string, // replace with your origin
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

router.on(['POST', 'GET'], '/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

router.on('GET', '/test', async (c) => {
	return c.json({ message: 'Hello world!' })
})

export default router