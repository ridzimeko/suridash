"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  DownloadCloud,
  HardDrive,
  Info,
  Search,
  X,
  MoreVertical,
  Trash2,
  Pencil,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";

export default function AgentsPage() {
  const [isCopied, setIsCopied] = useState(false);
  const [agentName, setAgentName] = useState("");

  const installCmd =
    "curl -fsSL https://suridash.local/agent/install.sh | sudo bash -s -- --token=eyJhbGciOiJIUzI1NiJ9.xyz123";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const agents = [
    {
      id: "agt_01",
      hostname: "prod-gateway-01",
      ip: "192.168.1.10",
      status: "online",
      version: "v1.4.2",
      lastSeen: "Just now",
    },
    {
      id: "agt_02",
      hostname: "db-monitor-node",
      ip: "10.0.4.55",
      status: "online",
      version: "v1.4.2",
      lastSeen: "2m ago",
    },
    {
      id: "agt_03",
      hostname: "legacy-firewall",
      ip: "10.0.2.11",
      status: "offline",
      version: "v1.3.0",
      lastSeen: "4d ago",
    },
  ];

  return (
    <div className="space-y-6 p-6 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Monitoring Agents
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Manage Suricata nodes connected to this dashboard.
          </p>
        </div>

        {/* ADD AGENT */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
              <DownloadCloud size={18} /> Deploy New Agent
            </button>
          </DialogTrigger>

          <DialogContent className="bg-white border border-slate-200 rounded-xl p-6 shadow-xl max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Deploy Monitoring Agent
              </DialogTitle>
            </div>

            <DialogDescription className="text-slate-600 text-sm mb-4">
              Provide an agent name and run the command below on your server.
            </DialogDescription>

            {/* INPUT AGENT NAME */}
            <Input
              placeholder="Agent Name (e.g. Production Gateway)"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="mb-4"
            />

            {/* INSTALL COMMAND */}
            <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 mb-4 relative">
              <code className="text-emerald-600 font-mono text-xs break-all">
                {installCmd}
              </code>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-white border rounded hover:bg-neutral-100"
              >
                {isCopied ? (
                  <Check size={14} className="text-emerald-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
              <Info size={18} className="text-blue-500" />
              <p className="text-xs text-blue-700">
                Requires <strong>root</strong> access. Token expires in 24 hours.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* AGENT LIST */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {/* FILTER */}
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              placeholder="Search agent hostname or IP..."
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-full"
            />
          </div>

          <Select value="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* TABLE */}
        <table className="w-full text-sm">
          <thead className="text-slate-600">
            <tr>
              <th className="p-4 text-left">Hostname</th>
              <th className="p-4 text-left">IP</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Version</th>
              <th className="p-4 text-left">Last Seen</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-slate-50">
                <td className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded">
                    <HardDrive size={18} />
                  </div>
                  <span className="font-medium text-slate-900">
                    {agent.hostname}
                  </span>
                </td>
                <td className="p-4 font-mono text-slate-600">{agent.ip}</td>
                <td className="p-4">
                  {agent.status === "online" ? (
                    <span className="text-emerald-600 font-medium">Online</span>
                  ) : (
                    <span className="text-slate-400">Offline</span>
                  )}
                </td>
                <td className="p-4 text-slate-500">{agent.version}</td>
                <td className="p-4 text-slate-500">{agent.lastSeen}</td>

                {/* ACTION DROPDOWN */}
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded hover:bg-slate-100">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil size={14} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 size={14} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
