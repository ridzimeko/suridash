import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useSystemStats(interval = 1000) {
  const [stats, setStats] = useState({
    cpu: 0,
    memory: 0,
    totalRam: 0,
    usedRam: 0,
    freeRam: 0,
    networkIn: 0,
    networkOut: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get("system/stats").json() as {
          cpu: number;
          memory: number;
          totalRam: number;
          usedRam: number;
          freeRam: number;
          networkIn: number;
          networkOut: number;
        };
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats(); // fetch di awal
    const id = setInterval(fetchStats, interval);

    return () => clearInterval(id);
  }, [interval]);

  return stats;
}
