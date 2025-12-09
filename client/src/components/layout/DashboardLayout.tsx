import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Sidebar from "@/components/layout/Sidebar"
import { Navigate, Outlet } from "react-router"
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "sonner";

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
            <main className="w-full h-screen px-6 py-4 overflow-auto">
                <SidebarTrigger />
                <Outlet />
            </main>
            <Toaster position="bottom-right" />
        </SidebarProvider>
    )
}