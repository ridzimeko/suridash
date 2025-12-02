import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Sidebar from "@/components/layout/Sidebar"
import { Outlet } from "react-router"

export default function DashboardLayout(): React.ReactElement {
    return (
        <SidebarProvider>
            <Sidebar />
            <main className="w-full h-screen px-6 py-4 overflow-auto">
                <SidebarTrigger />
                <Outlet />
            </main>
        </SidebarProvider>
    )
}