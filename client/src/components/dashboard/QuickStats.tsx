import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecentAlert } from '@/hooks/use-recent-alerts';
import dayjs from 'dayjs';

interface QuickStatsProps {
  recentAlerts: RecentAlert[];
  loading: boolean;
}

export default function QuickStats({ recentAlerts, loading }: QuickStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="text-sm text-muted-foreground">Loading alerts…</p>
        )}

        {!loading && recentAlerts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No recent alerts
          </p>
        )}

        <div className="space-y-3">
          {recentAlerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between border-b pb-3 last:border-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{alert.signature}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.srcIp} → {alert.destIp}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {dayjs(alert.timestamp).format('HH:mm:ss')}
                </p>
                <span
                  className={`text-xs font-medium ${
                    alert.severity === 1
                      ? 'text-red-500'
                      : alert.severity === 2
                      ? 'text-orange-500'
                      : alert.severity === 3
                      ? 'text-yellow-500'
                      : 'text-blue-500'
                  }`}
                >
                  Sev {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
