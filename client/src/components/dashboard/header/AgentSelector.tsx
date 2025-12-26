import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Server } from "lucide-react";
import { useAgentStore } from "@/store/agent-store";

export default function AgentSelector() {
  const agents = useAgentStore((s) => s.agents);
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const selectAgent = useAgentStore((s) => s.selectAgent);

  return (
    <Select
      value={selectedAgentId ?? ""}
      onValueChange={selectAgent}
    >
      <SelectTrigger className="w-[260px] flex items-center gap-2">
        <Server size={16} className="text-slate-500" />
        <SelectValue placeholder="Select Agent Server" />
      </SelectTrigger>

      <SelectContent>
        {agents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id}>
            <div className="flex items-center justify-between gap-3 w-full">
              <span>{agent.name}</span>
              <Badge
                variant={agent.status === "online" ? "default" : "secondary"}
                className={
                  agent.status === "online"
                    ? "bg-emerald-100 text-emerald-700"
                    : ""
                }
              >
                {agent.status}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
