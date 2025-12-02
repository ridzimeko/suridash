import MetricCard from '@/components/dashboard/MetricCard';
import ResourceMonitor from '@/components/dashboard/ResourceMonitor';
import ServiceStatus from '@/components/dashboard/ServiceStatus';
import QuickStats from '@/components/dashboard/QuickStats';
import { mockAlerts } from '@/lib/mockData';
import { Bell, Shield, FileCode, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useSystemStats } from '@/hooks/use-system-stats';

export default function Index() {
  const stats = useSystemStats(3000); // update setiap 3 detik

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
            value={890}
            icon={Bell}
            trend={{ value: 12, isPositive: false }}
          />
          <MetricCard
            title="Blocked IPs"
            value={112}
            icon={Shield}
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard
            title="Active Rules"
            value={256}
            icon={FileCode}
          />
          <MetricCard
            title="Service Status"
            value={"Running"}
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
            totalRam={stats.totalRam}
            usedRam={stats.usedRam}
            freeRam={stats.freeRam}
          />
          <ServiceStatus
            status={"running"}
            onStart={handleStart}
            onStop={handleStop}
            onRestart={handleRestart}
          />
        </div>

        <QuickStats recentAlerts={mockAlerts} />
      </div>
  );
}