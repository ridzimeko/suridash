import { create } from "zustand";
import type { Alert } from "@/types";
import { api } from "@/lib/api";

type AlertState = {
  alerts: Alert[];
  wsStatus: "connected" | "disconnected" | "error";
  setWsStatus: (status: "connected" | "disconnected" | "error") => void;
  addAlert: (a: Alert) => void;
  loadAlerts: (agentId?: string | null) => Promise<void>;
};

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  wsStatus: "disconnected",

  setWsStatus: (wsStatus) => set({ wsStatus }),

  loadAlerts: async (agentId?: string | null) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const searchParams: any = { page: 1, limit: 200 };
      if (agentId) searchParams.agentId = agentId;

      const res = await api
        .get("alerts", { searchParams })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .json<any>();
      if (res && res.data) {
        set({ alerts: res.data });
      }
    } catch (err) {
      console.error("Failed to load historical alerts:", err);
    }
  },

  addAlert: (alert) =>
    set((state) => {
      // Find existing alert by unique index columns
      const existingIdx = state.alerts.findIndex(
        (a) =>
          a.signatureId === alert.signatureId &&
          a.srcIp === alert.srcIp &&
          a.destIp === alert.destIp &&
          a.protocol === alert.protocol,
      );

      if (existingIdx !== -1) {
        // Update existing and move to top
        const newAlerts = [...state.alerts];
        newAlerts[existingIdx] = alert;
        const [updatedAlert] = newAlerts.splice(existingIdx, 1);
        return { alerts: [updatedAlert, ...newAlerts] };
      }

      // Prepend new alert
      return {
        alerts: [alert, ...state.alerts].slice(0, 200),
      };
    }),
}));
