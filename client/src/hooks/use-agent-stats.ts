import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type AgentStats = {
  totalAlerts: number;
  blockedIps: number;
};

export function useAgentStats(agentId: string | null) {
  const [stats, setStats] = useState<AgentStats | null>(null);

  useEffect(() => {
    if (!agentId) {
      return;
    }

    let cancelled = false;

    (async () => {
      const data = await api
        .get(`agents/${agentId}/stats`)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .json<any>() as AgentStats;
     
      if (!cancelled) setStats(data);
    })();

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  return agentId ? stats : null;
}
