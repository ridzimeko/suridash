import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { BlockedIP } from "@/types";

type BlockedIPResponse = {
  data: BlockedIP[];
};

export function useBlockedIPs(agentId?: string | null) {
  const [data, setData] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);

      try {
        const url = agentId ? `blocked-ips?agentId=${agentId}` : "blocked-ips";
        const res = await api.get(url).json<BlockedIPResponse>();
        if (isMounted) {
          setData(res.data);
        }
      } catch (e) {
        console.error("Failed loading blocked IPs:", e);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [agentId]);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const url = agentId ? `blocked-ips?agentId=${agentId}` : "blocked-ips";
      const res = await api.get(url).json<BlockedIPResponse>();
      setData(res.data);
    } catch (e) {
      console.error("Failed loading blocked IPs:", e);
    }

    setLoading(false);
  }, [agentId]);

  return { data, loading, refresh };
}
