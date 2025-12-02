// frontend/src/services/auth.js
import { api } from "../lib/api";

// ⬅ Login user
export async function login(email: string, password: string) {
  return api
    .post("auth/sign-in/email", {
      json: {
        email,
        password,
      },
    })
    .json();
}

// ⬅ Logout user
export async function logout() {
  return api.post("auth/sign-out").json();
}

// ⬅ Ambil session user
export async function getSession() {
  return api.get("auth/session").json();
}
