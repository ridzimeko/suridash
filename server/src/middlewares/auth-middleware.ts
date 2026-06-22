import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { users, Session } from "../db/schema/auth-schema.js";
import { eq } from "drizzle-orm";

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const parts = c.trim().split('=');
      return [parts[0], parts.slice(1).join('=')];
    })
  );
};

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.session;
    
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Please login first.",
      });
    }

    const [sessionRecord] = await db.select().from(Session).where(eq(Session.token, token));
    if (!sessionRecord || new Date(sessionRecord.expiresAt) < new Date()) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired session.",
      });
    }

    const [userRecord] = await db.select().from(users).where(eq(users.id, sessionRecord.userId));
    if (!userRecord) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not found.",
      });
    }

    (req as any).user = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
    };
    (req as any).session = sessionRecord;

    return next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired session.",
    });
  }
}
