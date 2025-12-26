import { Hono } from "hono";
import { db } from "../db/index.js";
import { agents } from "../db/schema/agents.js";
import { eq } from "drizzle-orm";
import type { AppEnv } from "src/types/index.js";

export const heartbeatRoute = new Hono<AppEnv>();

