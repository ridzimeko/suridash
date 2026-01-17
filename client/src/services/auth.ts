// frontend/src/services/auth.js
import { authClient } from "@/lib/auth-client";
import { api } from "../lib/api";

// ⬅ Login user
export async function login(email: string, password: string) {
  const res = await authClient.signIn.email({
    email,
    password,
  })
  return res;
}

// ⬅ Logout user
export async function logout() {
  const res = await authClient.signOut();
  return res;
}

// ⬅ Ambil session user
export async function getSession() {
  return api.get("auth/session").json();
}
