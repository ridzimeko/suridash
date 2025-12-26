import { api } from "@/lib/api";

export interface Agent {
  id: string;
  name: string;
  status: "online" | "offline";
}

export function fetchAgents() {
  return api("agents").json<Agent[]>();
}

export function createAgent(name: string) {
  return api("agents", {
    method: "POST",
    body: JSON.stringify({ name }),
  }).json();
}

export function updateAgent(id: string, name: string) {
  return api(`agents/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  }).json();
}

export function deleteAgent(id: string) {
  return api(`agents/${id}`, {
    method: "DELETE",
  }).json();
}
