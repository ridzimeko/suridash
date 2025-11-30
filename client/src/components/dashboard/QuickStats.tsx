import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Alert } from '@/types';
import dayjs from 'dayjs';

interface QuickStatsProps {
  recentAlerts: Alert[];
}

export default function QuickStats({ recentAlerts }: QuickStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentAlerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between border-b pb-3 last:border-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{alert.signature}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.sourceIP} → {alert.destIP}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {dayjs(alert.timestamp).format('HH:mm:ss')}
                </p>
                <span
                  className={`text-xs font-medium ${
                    alert.severity === 'critical'
                      ? 'text-red-500'
                      : alert.severity === 'high'
                      ? 'text-orange-500'
                      : alert.severity === 'medium'
                      ? 'text-yellow-500'
                      : 'text-blue-500'
                  }`}
                >
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}