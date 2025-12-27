import { create } from "zustand";

type AgentStatus = {
  suricata: {
    installed: boolean;
    running: boolean;
    eveLogExists: boolean;
    eveLogPath?: string;
    lastModified?: number;
  };
};

type AgentStatusState = {
  statusByAgent: Record<string, AgentStatus>;
  setStatus: (agentId: string, status: AgentStatus) => void;
};

export const useAgentStatusStore = create<AgentStatusState>((set) => ({
  statusByAgent: {},

  setStatus: (agentId, status) =>
    set((state) => ({
      statusByAgent: {
        ...state.statusByAgent,
        [agentId]: status,
      },
    })),
}));
