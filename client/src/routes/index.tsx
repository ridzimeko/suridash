import { Routes as LibRoutes, Route } from "react-router"
import Dashboard from "@/pages/Dashboard"
import LoginPage from "@/pages/Login"
import RealtimeAlerts from '@/pages/RealtimeAlerts';
import AttackMap from '@/pages/AttackMap';
import ChartsAnalytics from '@/pages/ChartsAnalytics';
import RulesEditor from '@/pages/RulesEditor';
import BlockHistory from '@/pages/BlockHistory';
import SystemLogs from '@/pages/SystemLogs';
import Settings from '@/pages/Settings';
import Integration from '@/pages/Integration';
import NotFound from '@/pages/NotFound';
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function Routes() {
    return (
        <LibRoutes>
            <Route element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="/realtime-alerts" element={<RealtimeAlerts />} />
                <Route path="/attack-map" element={<AttackMap />} />
                <Route path="/charts-analytics" element={<ChartsAnalytics />} />
                <Route path="/rules-editor" element={<RulesEditor />} />
                <Route path="/block-history" element={<BlockHistory />} />
                <Route path="/system-logs" element={<SystemLogs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/integration" element={<Integration />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
        </LibRoutes>
    )
}