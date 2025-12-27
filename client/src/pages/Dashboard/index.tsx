import MetricCard from '@/components/dashboard/MetricCard';
import ResourceMonitor from '@/components/dashboard/ResourceMonitor';
import ServiceStatus from '@/components/dashboard/ServiceStatus';
import QuickStats from '@/components/dashboard/QuickStats';
import { mockAlerts } from '@/lib/mockData';
import { Bell, Shield, FileCode, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { useWebsocket } from '@/hooks/use-websocket';
import { useMetricsStore } from '@/store/metrics-store';
import { useAgentStore } from '@/store/agent-store';

export default function Index() {
  useWebsocket();

  // ganti nanti pakai dropdown agent
  const agentId = useAgentStore((s) => s.selectedAgentId);

  console.log("Selected agent:", agentId);

  const metrics =
    useMetricsStore((s) =>
      agentId ? s.metricsByAgent[agentId] : undefined
    ) ?? [];

  const latestMetric = metrics.at(-1);

  console.log("latest", latestMetric)


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
          status={latestMetric ? 'online' : 'offline'}
          cpu={latestMetric?.payload?.cpu?.percent}
          memory={latestMetric?.payload?.memory.percent}
          networkIn={latestMetric?.payload?.network?.recv}
          networkOut={latestMetric?.payload?.network?.sent}
          totalRam={latestMetric?.payload?.memory.total}
          usedRam={latestMetric?.payload?.memory.used}
          freeRam={latestMetric?.payload?.memory.free}
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