import MetricCard from '@/components/dashboard/MetricCard';
import ResourceMonitor from '@/components/dashboard/ResourceMonitor';
import QuickStats from '@/components/dashboard/QuickStats';
import { Bell, Shield, FileCode, Activity } from 'lucide-react';
import { useMetricsStore } from '@/store/metrics-store';
import { useAgentStore } from '@/store/agent-store';
import { useAgentStatusStore } from '@/store/agent-status-store';
import { useAgentStats } from '@/hooks/use-agent-stats';
import { useRecentAlerts } from '@/hooks/use-recent-alerts';

export default function Index() {

  // ganti nanti pakai dropdown agent
  const agentId = useAgentStore((s) => s.selectedAgentId);

  const agentStatus = useAgentStatusStore(
    (s) => agentId ? s.statusByAgent[agentId] : undefined
  );

  const stats = useAgentStats(agentId);
  const recentAlerts = useRecentAlerts(agentId, 5);

  const metrics =
    useMetricsStore((s) =>
      agentId ? s.metricsByAgent[agentId] : undefined
    ) ?? [];

  const latestMetric = metrics.at(-1);

  const rulesLoaded = agentStatus?.suricata?.rulesLoaded ?? 0;
  const suricataRunning = agentStatus?.suricata?.running ?? false;

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
          value={stats?.totalAlerts ?? 0}
          icon={Bell}
        />
        <MetricCard
          title="Blocked IPs"
          value={stats?.blockedIps ?? 0}
          icon={Shield}
        />
        <MetricCard
          title="Active Rules"
          value={rulesLoaded}
          icon={FileCode}
        />
        <MetricCard
          title="Service Status"
          value={suricataRunning ? 'Running' : 'Stopped'}
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
        {/* <ServiceStatus
          isInstalled={agentStatus?.suricata.installed ?? false}
          status={agentStatus?.suricata.running ?? false}
          version={agentStatus?.suricata.version ?? 'N/A'}
          onStart={handleStart}
          onStop={handleStop}
          onRestart={handleRestart}
        /> */}
      <QuickStats recentAlerts={recentAlerts.alerts} loading={recentAlerts.loading} />
      </div>

    </div>
  );
}