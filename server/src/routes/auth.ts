import { Router, type Request, type Response } from "express";
import cors from "cors";
import { auth } from "../lib/auth.js";
import { toNodeHandler } from "better-auth/node";

const router = Router();

/* =========================
 * CORS FOR AUTH ROUTES
 * ========================= */
router.use(
  "/auth",
  cors({
    origin: process.env.ORIGIN_URL, // frontend origin
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "OPTIONS"],
    exposedHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

/* =========================
 * BETTER-AUTH HANDLER
 * ========================= */
router.all("/auth/*splat", toNodeHandler(auth));

/* =========================
 * TEST ROUTE
 * ========================= */
router.get("/test", (_req: Request, res: Response) => {
  res.json({ message: "Hello world!" });
});

export default router;
