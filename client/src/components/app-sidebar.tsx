import { Calendar, Home, Inbox, Search, Settings, Shield } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
    {
        title: "Beranda",
        url: "#",
        icon: Home,
    },
    {
        title: "Event Realtime",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Konfigurasi Rules",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Riwayat Blokir",
        url: "#",
        icon: Search,
    },
    {
        title: "Pengaturan",
        url: "#",
        icon: Settings,
    },
    {
        title: "Integrasi",
        url: "#",
        icon: Settings,
    },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">Suridash</span>
                        <span className="truncate text-xs">IDS/IPS Manager</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url} className="py-6">
                                            <item.icon />
                                            <span className="text-[1rem]">{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}