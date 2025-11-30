import { useState } from 'react';
import MetricCard from '@/components/dashboard/MetricCard';
import ResourceMonitor from '@/components/dashboard/ResourceMonitor';
import ServiceStatus from '@/components/dashboard/ServiceStatus';
import QuickStats from '@/components/dashboard/QuickStats';
import { mockSystemStats, mockAlerts } from '@/lib/mockData';
import { Bell, Shield, FileCode, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const [stats] = useState(mockSystemStats);

  const handleStart = () => {
    toast.success('Suricata service started successfully');
  };

  const handleStop = () => {
    toast.success('Suricata service stopped');
  };

  const handleRestart = () => {
    toast.success('Suricata service restarted');
  };

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your Suricata IDS/IPS system in real-time
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Alerts"
            value={stats.totalAlerts.toLocaleString()}
            icon={Bell}
            trend={{ value: 12, isPositive: false }}
          />
          <MetricCard
            title="Blocked IPs"
            value={stats.blockedIPs}
            icon={Shield}
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard
            title="Active Rules"
            value={stats.activeRules.toLocaleString()}
            icon={FileCode}
          />
          <MetricCard
            title="Service Status"
            value={stats.serviceStatus}
            icon={Activity}
            className="capitalize"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ResourceMonitor
            cpu={stats.cpu}
            memory={stats.memory}
            networkIn={stats.networkIn}
            networkOut={stats.networkOut}
          />
          <ServiceStatus
            status={stats.serviceStatus}
            onStart={handleStart}
            onStop={handleStop}
            onRestart={handleRestart}
          />
        </div>

        <QuickStats recentAlerts={mockAlerts} />
      </div>
  );
}