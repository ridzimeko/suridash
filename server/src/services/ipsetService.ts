// src/services/ipsetService.ts
import { exec } from "child_process";
import { promisify } from "util";
import { db } from "../db/index.js";
import { blockedIps } from "../db/schema/dashboard-schema.js";
import { eq } from "drizzle-orm";

const execp = promisify(exec);
const IPSET_NAME = "blacklist";

async function run(cmd: string) {
  try {
    const { stdout, stderr } = await execp(cmd);
    return { stdout, stderr };
  } catch (err: any) {
    throw new Error(err.stderr ?? err.message);
  }
}

export async function ensureIpset() {
  // create set if not exist
  await run(`sudo ipset create ${IPSET_NAME} hash:ip -exist`);
  // ensure iptables rule exists
  try {
    await run(`sudo iptables -C INPUT -m set --match-set ${IPSET_NAME} src -j DROP`);
  } catch {
    // not exists -> add
    await run(`sudo iptables -I INPUT -m set --match-set ${IPSET_NAME} src -j DROP`);
  }
}

export async function ipsetAdd(ip: string) {
  // add, ignore if exists
  await run(`sudo ipset add ${IPSET_NAME} ${ip} -exist`);
}

export async function ipsetDel(ip: string) {
  // remove if exists
  await run(`sudo ipset del ${IPSET_NAME} ${ip}`).catch(() => null);
}

export async function ipsetList(): Promise<string[]> {
  const r = await run(`sudo ipset list ${IPSET_NAME} -o save`);
  // parse output for 'add blacklist <ip>'
  const lines = (r.stdout || "").split("\n");
  const members = lines
    .filter((l) => l.startsWith(`add ${IPSET_NAME} `))
    .map((l) => l.split(" ")[2])
    .filter(Boolean);
  return members;
}

/** High-level: block IP (DB + ipset) */
export async function blockIpAndRecord(opts: {
  ip: string;
  reason?: string;
  attackType?: string;
  ttlMinutes?: number; // optional
  autoBlocked?: boolean;
  city?: string | null;
  country?: string | null;
}) {
  const { ip, reason = "auto block", attackType = "unknown", ttlMinutes, autoBlocked = true, city = null, country = null } = opts;

  // skip private/local
  if (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip === "127.0.0.1" ||
    ip === "::1"
  ) {
    throw new Error("Refuse to block local/private IP");
  }

  await ensureIpset();
  await ipsetAdd(ip);

  const blockedUntil = ttlMinutes ? new Date(Date.now() + ttlMinutes * 60_000) : null;

  const inserted = await db.insert(blockedIps).values({
    ip,
    reason,
    attackType,
    createdAt: new Date(),
    blockedUntil,
    city,
    country,
    isActive: true,
    autoBlocked,
  }).returning();

  return inserted[0];
}

/** Unblock (DB + ipset) */
export async function unblockIp(idOrIp: { id?: number; ip?: string }) {
  const { id, ip } = idOrIp;
  let row;

  if (id) {
    const res = await db.select().from(blockedIps).where(eq(blockedIps.id, id)).limit(1);
    row = res[0];
  } else if (ip) {
    const res = await db.select().from(blockedIps).where(eq(blockedIps.ip, ip)).limit(1);
    row = res[0];
  }

  if (!row) throw new Error("Not found");

  await ipsetDel(row.ip);

  // mark as inactive
  const updated = await db.update(blockedIps).set({ isActive: false }).where(eq(blockedIps.id, row.id)).returning();
  return updated[0];
}
