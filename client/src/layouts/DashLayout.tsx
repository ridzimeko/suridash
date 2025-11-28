import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import type { ReactNode } from "react"

export default function DashLayout({ children }: { children: ReactNode }): React.ReactElement {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}