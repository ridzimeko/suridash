import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Cpu, HardDrive, Network, Wifi, WifiOff } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface ResourceMonitorProps {
  status?: 'online' | 'offline';
  cpu?: number;
  memory?: number;
  totalRam?: number;
  usedRam?: number;
  freeRam?: number;
  networkIn?: number;
  networkOut?: number;
}

export default function ResourceMonitor({
  status = 'offline',
  cpu = 0,
  memory = 0,
  totalRam = 0,
  usedRam = 0,
  freeRam = 0,
  networkIn = 0,
  networkOut = 0,
}: ResourceMonitorProps) {
  const isOnline = status === 'online';

  const MAX_NET = 5 * 1024 * 1024; // 5 MB/s

  const networkPercent = isOnline
    ? Math.min((networkIn / MAX_NET) * 100, 100)
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resource Monitor</CardTitle>

        <Badge
          variant={isOnline ? 'default' : 'destructive'}
          className="flex items-center gap-1"
        >
          {isOnline ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* CPU */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">CPU Usage</span>
            </div>
            <span className="text-sm font-bold">
              {isOnline ? `${cpu}%` : '-'}
            </span>
          </div>
          <Progress value={isOnline ? cpu : 0} className="h-2" />
        </div>

        {/* MEMORY */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Memory Usage</span>
            </div>
            <span className="text-sm font-bold">
              {isOnline ? `${memory}%` : '-'}
            </span>
          </div>
          <Progress value={isOnline ? memory : 0} className="h-2" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total: {isOnline ? formatBytes(totalRam) : '-'}</span>
            <span>Used: {isOnline ? formatBytes(usedRam) : '-'}</span>
            <span>Free: {isOnline ? formatBytes(freeRam) : '-'}</span>
          </div>
        </div>

        {/* NETWORK */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Network</span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>↓ In: {isOnline ? formatBytes(networkIn) : '-'}/s</span>
            <span>↑ Out: {isOnline ? formatBytes(networkOut) : '-'}/s</span>
          </div>

          <Progress
            value={networkPercent}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
