import { create } from "zustand";

export type SystemMetric = {
  agentId: string;
  type: "system_metrics";
  payload: {
    cpu: { percent: number; cores: number };
    memory: { total: number; used: number; percent: number; free: number };
    disk: { total: number; used: number; percent: number };
    network: { recv: number; sent: number };
  };
  timestamp: number;
};

type MetricsState = {
  metricsByAgent: Record<string, SystemMetric[]>;
  addMetric: (metric: SystemMetric) => void;
};

export const useMetricsStore = create<MetricsState>((set) => ({
  metricsByAgent: {},

  addMetric: (metric) =>
    set((state) => {
      const list = state.metricsByAgent[metric.agentId] ?? [];

      const next = {
        ...state.metricsByAgent,
        [metric.agentId]: [...list.slice(-29), metric],
      };

      console.log("STORE AFTER:", next);

      return { metricsByAgent: next };
    }),
}));
