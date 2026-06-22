import { api } from "../lib/api";

export async function login(email: string, password: string) {
  return api.post("auth/sign-in", { json: { email, password } }).json();
}

export async function logout() {
  return api.post("auth/sign-out").json();
}

export async function getSession() {
  return api.get("auth/session").json();
}
