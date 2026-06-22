import { db } from "../db/index.js";
import { users } from "../db/schema/auth-schema.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function seed() {
  console.log("➡ Creating seed admin user...");

  try {
    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      email: "admin@suridash.id",
      password: hashedPassword,
      name: "Super Admin",
    });

    console.log("✅ User created successfully!");
  } catch (error) {
    console.error("❌ Failed to create user:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
