import { create } from "zustand";

type Alert = {
  agentId: string;
  timestamp: string;
  srcIp: string;
  destIp: string;
  signature: string;
  category: string;
  severity: number;
};

type AlertState = {
  alerts: Alert[];
  addAlert: (a: Alert) => void;
};

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 200),
    })),
}));
