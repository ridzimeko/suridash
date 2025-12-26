import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAgentStore } from "@/store/agent-store";

export default function AgentSelector() {
  const { agents, selectedAgentId, selectAgent } = useAgentStore();

  const hasAgents = agents.length > 0;

  return (
    <Select
      value={selectedAgentId ?? ""}
      onValueChange={selectAgent}
      disabled={!hasAgents}
    >
      <SelectTrigger className="w-[240px]">
        <SelectValue
          placeholder={hasAgents ? "Select Agent" : "No agents available"}
        />
      </SelectTrigger>

      <SelectContent>
        {agents.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            {a.name} ({a.status})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
