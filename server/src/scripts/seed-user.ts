import { auth } from "@/lib/auth";

async function seed() {
  console.log("➡ Creating seed admin user...");

  const res = await auth.api.signUpEmail({
    body: {
      email: "admin@suridash.id",
      password: "Admin123!",
      name: "Super Admin",
    },
    asResponse: true
  });

  if (!res.ok) {
    console.error("❌ Failed to create user:", res.statusText);
    process.exit(1);
  }

  console.log("✅ User created:", res.statusText);

  process.exit(0);
}

seed();
