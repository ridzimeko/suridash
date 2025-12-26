import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Sidebar from "@/components/layout/Sidebar";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useAgentStore } from "@/store/agent-store";
import AgentSelector from "../dashboard/header/AgentSelector";

function InitAgents() {
  const setAgents = useAgentStore((s) => s.setAgents);

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => setAgents(data));
  }, [setAgents]);

  return null;
}

export default function DashboardLayout(): React.ReactElement {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <header className="flex shrink-0 p-2 items-center gap-2 border-b">
          <SidebarTrigger />
          <AgentSelector />
        </header>
        <main className="px-6 py-4 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>

      <Toaster position="bottom-right" />
      <InitAgents />
    </SidebarProvider>
  );
}
