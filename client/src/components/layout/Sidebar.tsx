import { Link, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Bell,
  BarChart3,
  Shield,
  Plug,
  Activity,
  HardDrive,
} from "lucide-react";

const menuItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/realtime-alerts", icon: Bell, label: "Realtime Alerts" },
  { path: "/charts-analytics", icon: BarChart3, label: "Charts & Analytics" },
  { path: "/block-history", icon: Shield, label: "Block History" },
  { path: "/agents", icon: HardDrive, label: "Manage Agents" },
  { path: "/integration", icon: Plug, label: "Integration" },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      {/* HEADER */}
      <SidebarHeader className="h-16 border-b">
        <div className="flex items-center gap-2 px-2">
          <Activity className="h-7 w-7 text-primary shrink-0" />

          {/* TEXT: auto hide saat collapsed */}
          <div
            className="flex flex-col leading-tight overflow-hidden 
      group-data-[collapsible=icon]:hidden"
          >
            <span className="font-bold text-primary whitespace-nowrap">
              SuriDash
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              IDS/IPS Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.path}>
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="border-t">
        <div className="px-2 py-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
            {/* STATUS DOT */}
            <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />

            {/* TEXT – auto hide saat collapsed */}
            <div
              className="flex flex-col overflow-hidden 
        group-data-[collapsible=icon]:hidden"
            >
              <span className="text-xs font-medium whitespace-nowrap">
                System Status
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
