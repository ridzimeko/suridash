import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

export type RecentAlert = {
  id: number;
  signature: string;
  srcIp: string;
  destIp: string;
  severity: number;
  timestamp: string;
};

type ApiResponse = RecentAlert[];

export function useRecentAlerts(agentId: string | null, limit = 5) {
  const [alerts, setAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(
    async (signal?: AbortSignal) => {
      // ✅ guard: kalau agentId null, jangan fetch dan jangan setLoading(true)
      if (!agentId) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      // Hindari render ekstra kalau sudah loading
      setLoading((prev) => (prev ? prev : true));

      try {
        const res = await api
          .get(`agents/${agentId}/alerts`, {
            searchParams: { limit: String(limit) },
            signal,
          })
          .json<ApiResponse>();

        setAlerts(res ?? []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        // Abort itu normal
        if (e?.name !== "AbortError") {
          setAlerts([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [agentId, limit]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAlerts(controller.signal);
    return () => controller.abort();
  }, [fetchAlerts]);

  // refresh manual tetap bisa dipakai
  const refresh = useCallback(() => fetchAlerts(), [fetchAlerts]);

  return { alerts, loading, refresh };
}
