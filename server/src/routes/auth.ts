import { Router, type Request, type Response } from "express";
import { auth } from "../lib/auth.js";
import { toNodeHandler } from "better-auth/node";

const router = Router();

/* =========================
 * BETTER-AUTH HANDLER
 * ========================= */
router.all("/*", toNodeHandler(auth));

/* =========================
 * TEST ROUTE
 * ========================= */
router.get("/test", (_req: Request, res: Response) => {
  res.json({ message: "Hello world!" });
});

export default router;
