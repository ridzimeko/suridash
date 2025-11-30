import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCw } from 'lucide-react';
import { type ServiceStatus as ServiceStatusType } from '@/types';
import { cn } from '@/lib/utils';

interface ServiceStatusProps {
  status: ServiceStatusType;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
}

export default function ServiceStatus({
  status,
  onStart,
  onStop,
  onRestart,
}: ServiceStatusProps) {
  const getStatusColor = (status: ServiceStatusType) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
    }
  };

  const getStatusBadge = (status: ServiceStatusType) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500">Running</Badge>;
      case 'stopped':
        return <Badge variant="secondary">Stopped</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suricata Service</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('h-3 w-3 rounded-full', getStatusColor(status))}></div>
            <span className="text-sm font-medium">Service Status</span>
          </div>
          {getStatusBadge(status)}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onStart}
            disabled={status === 'running'}
            className="flex-1"
          >
            <Play className="mr-2 h-4 w-4" />
            Start
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onStop}
            disabled={status === 'stopped'}
            className="flex-1"
          >
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRestart}
            disabled={status === 'stopped'}
            className="flex-1"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Restart
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-3 text-xs">
          <p className="font-medium">Service Information</p>
          <div className="mt-2 space-y-1 text-muted-foreground">
            <p>Version: 7.0.3</p>
            <p>Uptime: 2d 14h 32m</p>
            <p>Interface: eth0</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}