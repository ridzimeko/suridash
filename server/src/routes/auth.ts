import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { users, session } from "../db/schema/auth-schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const router = Router();

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const parts = c.trim().split('=');
      return [parts[0], parts.slice(1).join('=')];
    })
  );
};

export const requireAuth = async (req: Request, res: Response, next: any) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.session;
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const [sessionRecord] = await db.select().from(session).where(eq(session.token, token));
  if (!sessionRecord || new Date(sessionRecord.expiresAt) < new Date()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const [userRecord] = await db.select().from(users).where(eq(users.id, sessionRecord.userId));
  if (!userRecord) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Inject user info
  (req as any).user = {
    id: userRecord.id,
    email: userRecord.email,
    name: userRecord.name,
  };
  
  next();
};

router.post("/sign-up", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const [newUser] = await db.insert(users).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
    }).returning();

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await db.insert(session).values({
      id: crypto.randomUUID(),
      userId: newUser.id,
      token,
      expiresAt: expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    res.json({ user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sign-in", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const [userRecord] = await db.select().from(users).where(eq(users.email, email));
    if (!userRecord) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, userRecord.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await db.insert(session).values({
      id: crypto.randomUUID(),
      userId: userRecord.id,
      token,
      expiresAt: expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    res.json({ user: { id: userRecord.id, email: userRecord.email, name: userRecord.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sign-out", async (req: Request, res: Response) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.session;
    
    if (token) {
      await db.delete(session).where(eq(session.token, token));
    }

    res.clearCookie("session", { path: "/" });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/session", async (req: Request, res: Response) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.session;
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [sessionRecord] = await db.select().from(session).where(eq(session.token, token));
    if (!sessionRecord || new Date(sessionRecord.expiresAt) < new Date()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [userRecord] = await db.select().from(users).where(eq(users.id, sessionRecord.userId));
    if (!userRecord) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.json({ user: { id: userRecord.id, email: userRecord.email, name: userRecord.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
