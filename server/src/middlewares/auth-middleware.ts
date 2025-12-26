import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 🔐 Ambil session dari Better Auth (cookie-based)
    const session = await auth.api.getSession({
      headers: req.headers as HeadersInit,
    });

    // ❌ Tidak ada session
    if (!session) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Please login first.",
      });
    }

    // ✅ Inject ke request (pengganti c.set)
    (req as any).user = session.user;
    (req as any).session = session.session;

    return next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired session.",
    });
  }
}
