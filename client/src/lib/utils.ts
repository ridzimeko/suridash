import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(4).toString("hex")}`;
}

export function generateApiKey() {
  return crypto.randomBytes(24).toString("hex");
}

export function generateInstallToken() {
  return crypto.randomBytes(32).toString("hex");
}
