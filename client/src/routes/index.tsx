import { Routes as LibRoutes, Route } from "react-router"
import NotFound from '@/pages/NotFound';
import DashboardLayout from '@/components/layout/DashboardLayout'
import React from "react";
import LoginPage from "@/pages/Login";

export default function Routes() {
    const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
    const RealtimeAlerts = React.lazy(() => import('@/pages/RealtimeAlerts'));
    const ChartsAnalytics = React.lazy(() => import('@/pages/ChartsAnalytics'));
    const BlockHistory = React.lazy(() => import('@/pages/BlockHistory'));
    const Integration = React.lazy(() => import('@/pages/Integration'));
    const AgentManagement = React.lazy(() => import('@/pages/AgentManagement'));
    // const LoginPage = React.lazy(() => import('@/pages/Login'));

    return (
        <LibRoutes>
            <Route element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="/realtime-alerts" element={<RealtimeAlerts />} />
                <Route path="/charts-analytics" element={<ChartsAnalytics />} />
                <Route path="/block-history" element={<BlockHistory />} />
                <Route path="/notification" element={<Integration />} />
                <Route path="/agents" element={<AgentManagement />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
        </LibRoutes>
    )
}