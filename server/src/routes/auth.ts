import { Hono } from 'hono'
import { auth } from '../lib/auth.js'
import { cors } from 'hono/cors';
import type { AppEnv } from '../types/index.js';

const router = new Hono<AppEnv>({
  strict: false,
})

router.use(
	"/auth/*", // or replace with "*" to enable cors for all routes
	cors({
		origin: process.env.ORIGIN_URL!, // replace with your origin
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