import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { BlockedIP } from "@/types";

type BlockedIPResponse = {
  page: number,
  total: number
  data: BlockedIP[];
}

export function useBlockedIPs() {
  const [data, setData] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get("blocked-ips").json<BlockedIPResponse>();
      setData(res.data);
    } catch (e) {
      console.error("Failed fetching blocked IPs", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refresh: fetchData };
}
