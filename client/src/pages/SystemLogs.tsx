import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { mockLogs } from '@/lib/mockData';
import dayjs from 'dayjs';
import { Download, RefreshCw } from 'lucide-react';
import type { LogLevel } from '@/types';

export default function SystemLogs() {
    const [logs] = useState(mockLogs);
    const [levelFilter, setLevelFilter] = useState<string>('all');

    const filteredLogs = logs.filter(
        (log) => levelFilter === 'all' || log.level === levelFilter
    );

    const getLevelColor = (level: LogLevel) => {
        switch (level) {
            case 'error':
                return 'bg-red-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'info':
                return 'bg-blue-500';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">System Logs</h1>
                    <p className="text-muted-foreground">
                        View Suricata service logs and system messages
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Logs
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Filter Logs</CardTitle>
                        <Select value={levelFilter} onValueChange={setLevelFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Log Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Log Entries ({filteredLogs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className="flex items-start gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                            >
                                <Badge className={getLevelColor(log.level)}>
                                    {log.level.toUpperCase()}
                                </Badge>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{log.message}</p>
                                        <span className="text-xs text-muted-foreground">
                                            {dayjs(log.timestamp).format('MMM DD, YYYY HH:mm:ss')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Source: {log.source}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}