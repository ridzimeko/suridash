import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Bell,
  Map,
  BarChart3,
  FileCode,
  Shield,
  FileText,
  Settings,
  Plug,
  Activity,
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/realtime-alerts', icon: Bell, label: 'Realtime Alerts' },
  { path: '/attack-map', icon: Map, label: 'Attack Map' },
  { path: '/charts-analytics', icon: BarChart3, label: 'Charts & Analytics' },
  { path: '/rules-editor', icon: FileCode, label: 'Rules Editor' },
  { path: '/block-history', icon: Shield, label: 'Block History' },
  { path: '/system-logs', icon: FileText, label: 'System Logs' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/integration', icon: Plug, label: 'Integration' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-primary">Suricata</h1>
          <p className="text-xs text-muted-foreground">IDS/IPS Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs font-medium">System Status</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}