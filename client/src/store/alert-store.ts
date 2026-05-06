import { create } from "zustand";
import type { Alert } from "@/types";
import { api } from "@/lib/api";

type AlertState = {
  alerts: Alert[];
  wsStatus: "connected" | "disconnected" | "error";
  setWsStatus: (status: "connected" | "disconnected" | "error") => void;
  addAlert: (a: Alert) => void;
  loadAlerts: () => Promise<void>;
};

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  wsStatus: "disconnected",

  setWsStatus: (wsStatus) => set({ wsStatus }),

  loadAlerts: async () => {
    try {
      const res = await api
        .get("alerts", { searchParams: { page: 1, limit: 200 } })
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
          a.srcPort === alert.srcPort &&
          a.destIp === alert.destIp &&
          a.destPort === alert.destPort &&
          a.protocol === alert.protocol
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
