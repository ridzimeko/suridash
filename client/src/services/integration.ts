import { api } from "@/lib/api";
import type { Integration } from "@/types";

export async function getIntegrations(): Promise<Integration[]> {
  return api.get("integrations").json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveIntegration(provider: string, config: any, enabled: boolean, id?: number) {
  if (id) {
    // update
    return api.put(`integrations/${id}`, {
      json: { provider, config, enabled },
    }).json();
  }

  // create
  return api.post("integrations", {
    json: { provider, config, enabled },
  }).json();
}

// test email or telegram
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function testIntegration(provider: string, config: any) {
  return api.post("integrations/test", {
    json: { provider, config },
  }).json();
}
