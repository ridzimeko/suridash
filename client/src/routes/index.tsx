import { Routes as LibRoutes, Route } from "react-router"
import NotFound from '@/pages/NotFound';
import DashboardLayout from '@/components/layout/DashboardLayout'
import React from "react";

export default function Routes() {
    const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
    const RealtimeAlerts = React.lazy(() => import('@/pages/RealtimeAlerts'));
    const AttackMap = React.lazy(() => import('@/pages/AttackMap'));
    const ChartsAnalytics = React.lazy(() => import('@/pages/ChartsAnalytics'));
    const RulesEditor = React.lazy(() => import('@/pages/RulesEditor'));
    const BlockHistory = React.lazy(() => import('@/pages/BlockHistory'));
    const SystemLogs = React.lazy(() => import('@/pages/SystemLogs'));
    const Settings = React.lazy(() => import('@/pages/Settings'));
    const Integration = React.lazy(() => import('@/pages/Integration'));
    const LoginPage = React.lazy(() => import('@/pages/Login'));

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