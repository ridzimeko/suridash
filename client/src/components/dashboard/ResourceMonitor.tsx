import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cpu, HardDrive, Network } from 'lucide-react';

interface ResourceMonitorProps {
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
}

export default function ResourceMonitor({
  cpu,
  memory,
  networkIn,
  networkOut,
}: ResourceMonitorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">CPU Usage</span>
            </div>
            <span className="text-sm font-bold">{cpu}%</span>
          </div>
          <Progress value={cpu} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Memory Usage</span>
            </div>
            <span className="text-sm font-bold">{memory}%</span>
          </div>
          <Progress value={memory} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Network</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>↓ In: {networkIn} MB/s</span>
            <span>↑ Out: {networkOut} MB/s</span>
          </div>
          <Progress value={(networkIn / 200) * 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}