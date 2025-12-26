"use client";

import { useEffect, useState } from "react";
import {
  DownloadCloud,
  HardDrive,
  Info,
  Search,
  MoreVertical,
  Trash2,
  Pencil,
  Copy,
  Check,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useAgentStore } from "@/store/agent-store";
import {
  createAgent,
  updateAgent,
  deleteAgent,
} from "@/services/agentService";

/* =============================
 * TYPES
 * ============================= */
interface EditState {
  id: string;
  name: string;
}

export default function AgentsPage() {
  /* =======================
   * GLOBAL STORE
   * ======================= */
  const {
    agents,
    loading,
    loadAgents,
    clearSelectionIfDeleted,
  } = useAgentStore();

  /* =======================
   * LOCAL STATE
   * ======================= */
  const [agentName, setAgentName] = useState("");
  const [installCmd, setInstallCmd] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const [creating, setCreating] = useState(false);

  const [editAgent, setEditAgent] = useState<EditState | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* =======================
   * LOAD AGENTS
   * ======================= */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!cancelled) await loadAgents();
    })();

    return () => {
      cancelled = true;
    };
  }, [loadAgents]);

  /* =======================
   * CREATE AGENT
   * ======================= */
  const handleCreateAgent = async () => {
    if (!agentName.trim() || creating) return;

    try {
      setCreating(true);
      const res = await createAgent(agentName.trim());
      setInstallCmd(res.installCommand);
      setAgentName("");
      await loadAgents();
    } finally {
      setCreating(false);
    }
  };

  /* =======================
   * EDIT AGENT
   * ======================= */
  const handleEditAgent = async () => {
    if (!editAgent?.name.trim()) return;

    await updateAgent(editAgent.id, editAgent.name.trim());
    setEditAgent(null);
    await loadAgents();
  };

  /* =======================
   * DELETE AGENT
   * ======================= */
  const confirmDelete = async () => {
    if (!deleteId) return;

    await deleteAgent(deleteId);
    clearSelectionIfDeleted(deleteId);
    setDeleteId(null);
    await loadAgents();
  };

  /* =======================
   * COPY INSTALL CMD
   * ======================= */
  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  /* =======================
   * RENDER
   * ======================= */
  return (
    <div className="space-y-6 p-6 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Monitoring Agents</h2>
          <p className="text-sm text-muted-foreground">
            Manage Suricata nodes connected to this dashboard.
          </p>
        </div>

        {/* DEPLOY AGENT */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <DownloadCloud size={18} />
              Deploy New Agent
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogTitle>Deploy Monitoring Agent</DialogTitle>
            <DialogDescription>
              Enter agent name and run the generated command.
            </DialogDescription>

            <Input
              className="mt-4"
              placeholder="Agent Name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateAgent()}
              disabled={creating}
            />

            <Button
              className="mt-4 w-full"
              onClick={handleCreateAgent}
              disabled={creating || !agentName.trim()}
            >
              {creating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate Install Command
            </Button>

            {installCmd && (
              <div className="mt-4 bg-muted border rounded-lg p-4 relative">
                <code className="text-xs text-emerald-600 break-all">
                  {installCmd}
                </code>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-2 bg-white border rounded"
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            )}

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <Info size={16} />
              <p className="text-xs">
                Requires <strong>root</strong> access. Token expires in 24 hours.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ================= AGENT LIST ================= */}
      <div className="bg-white border rounded-lg shadow-sm">
        {/* FILTER */}
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-2.5 text-muted-foreground"
              size={16}
            />
            <input
              placeholder="Search agent..."
              className="pl-9 pr-4 py-2 border rounded-lg w-full text-sm"
            />
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Loading agents...
          </div>
        ) : agents.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No agent registered
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="p-4 text-left">Agent</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Last Seen</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-muted/50">
                  <td className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-muted rounded">
                      <HardDrive size={18} />
                    </div>
                    <span className="font-medium">{agent.name}</span>
                  </td>

                  <td className="p-4">
                    <Badge
                      variant={
                        agent.status === "online"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {agent.status}
                    </Badge>
                  </td>

                  <td className="p-4 text-muted-foreground">
                    {agent.lastSeenAt ?? "-"}
                  </td>

                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            setEditAgent({
                              id: agent.id,
                              name: agent.name,
                            })
                          }
                        >
                          <Pencil size={14} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteId(agent.id)}
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= EDIT MODAL ================= */}
      <Dialog open={!!editAgent} onOpenChange={() => setEditAgent(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>Update agent name.</DialogDescription>

          <Input
            className="mt-4"
            value={editAgent?.name ?? ""}
            onChange={(e) =>
              setEditAgent(
                editAgent
                  ? { ...editAgent, name: e.target.value }
                  : null
              )
            }
            onKeyDown={(e) => e.key === "Enter" && handleEditAgent()}
          />

          <Button className="mt-4 w-full" onClick={handleEditAgent}>
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>

      {/* ================= DELETE MODAL ================= */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
