import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Alert } from "@/types";

export function useAlerts(page = 1, limit = 100) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api
        .get("alerts", { searchParams: { page, limit } })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .json<any>();

      setAlerts(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // Fetch on load
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, total, loading, refresh: fetchAlerts };
}
