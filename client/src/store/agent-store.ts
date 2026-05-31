import { create } from "zustand";
import { fetchAgents } from "@/services/agentService";

export interface Agent {
  id: string;
  name: string;
  status: "online" | "offline";
  lastSeenAt?: string;
}

interface AgentStore {
  agents: Agent[];
  selectedAgentId: string | null;
  loading: boolean;

  loadAgents: () => Promise<void>;
  selectAgent: (id: string) => void;
  clearSelectionIfDeleted: (id: string) => void;
  updateAgentStatus: (id: string, status: "online" | "offline", lastSeenAt?: string) => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  selectedAgentId: null,
  loading: false,

  // 🔹 LOAD dari API (SATU PINTU)
  loadAgents: async () => {
    set({ loading: true });
    const agents = await fetchAgents();

    const prevSelected = get().selectedAgentId;
    const stillExists = agents.some((a: { id: string | null; }) => a.id === prevSelected);

    set({
      agents,
      selectedAgentId: stillExists
        ? prevSelected
        : agents[0]?.id ?? null,
      loading: false,
    });
  },

  // 🔹 SELECT dari HEADER
  selectAgent: (id) => {
    localStorage.setItem("selectedAgentId", id);
    set({ selectedAgentId: id });
  },

  // 🔹 Kalau agent dihapus
  clearSelectionIfDeleted: (id) => {
    const { selectedAgentId, agents } = get();

    if (selectedAgentId === id) {
      const next = agents.find(a => a.id !== id);
      set({ selectedAgentId: next?.id ?? null });
    }
  },

  updateAgentStatus: (id, status, lastSeenAt) => {
    const { agents } = get();
    const updatedAgents = agents.map(a => 
      a.id === id ? { ...a, status, lastSeenAt: lastSeenAt || a.lastSeenAt } : a
    );
    set({ agents: updatedAgents });
  },
}));
