import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { BlockedIP } from "@/types";

type BlockedIPResponse = {
  data: BlockedIP[];
};

export function useBlockedIPs() {
  const [data, setData] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get("blocked-ips").json<BlockedIPResponse>();
      setData(res.data);
    } catch (e) {
      console.error("Failed loading blocked IPs:", e);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refresh: fetchData };
}
