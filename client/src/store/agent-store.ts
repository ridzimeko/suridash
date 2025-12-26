import { create } from "zustand";

export interface Agent {
  id: string;
  name: string;
  status: "online" | "offline";
}

interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  setAgents: (agents: Agent[]) => void;
  selectAgent: (id: string) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  selectedAgentId: null,

  setAgents: (agents) =>
    set({
      agents,
      selectedAgentId: agents.length ? agents[0].id : null,
    }),

  selectAgent: (id) =>
    set({
      selectedAgentId: id,
    }),
}));
