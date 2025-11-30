import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import Sidebar from "@/components/layout/Sidebar"
import type { ReactNode } from "react"

export default function DashLayout({ children }: { children: ReactNode }): React.ReactElement {
    return (
        <SidebarProvider>
            <Sidebar />
            <main className="w-full h-screen px-6 py-4 overflow-auto">
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}