import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
// import { mockAlerts } from '@/lib/mockData';
import dayjs from 'dayjs';
import { Search, RefreshCw, Download } from 'lucide-react';
import type { SeverityLevel } from '@/types';
import { useRealtimeAlerts } from '@/hooks/use-realtime-alers';

export default function RealtimeAlerts() {
    const { alerts, status } = useRealtimeAlerts();
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const filteredAlerts = alerts.filter((alert) => {
        const matchesSearch =
            alert.sourceIP.includes(searchTerm) ||
            alert.signature.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity =
            severityFilter === 'all' || alert.severity === severityFilter;
        const matchesCategory =
            categoryFilter === 'all' || alert.category === categoryFilter;
        return matchesSearch && matchesSeverity && matchesCategory;
    });

    const getSeverityColor = (severity: SeverityLevel) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-500';
            case 'high':
                return 'bg-orange-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-blue-500';
        }
    };

    const categories = Array.from(new Set(alerts.map((a) => a.category)));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Realtime Alerts</h1>
                    <p className="text-muted-foreground">
                        Monitor security alerts in real-time
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* socket status indicator */}
                    <div className="flex items-center gap-2">
                        <span
                            className={`h-3 w-3 rounded-full ${status === "connected" ? "bg-green-500" :
                                    status === "error" ? "bg-red-500" :
                                        "bg-yellow-500"
                                }`}
                        ></span>
                        <span className="text-sm capitalize">{status}</span>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by IP or signature..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severities</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Alerts ({filteredAlerts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Signature</TableHead>
                                <TableHead>Source IP</TableHead>
                                <TableHead>Dest IP</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAlerts.map((alert) => (
                                <TableRow key={alert.id}>
                                    <TableCell className="font-mono text-xs">
                                        {dayjs(alert.timestamp).format('HH:mm:ss')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getSeverityColor(alert.severity)}>
                                            {alert.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">{alert.category}</TableCell>
                                    <TableCell className="max-w-xs truncate text-sm">
                                        {alert.signature}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {alert.sourceIP}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {alert.destIP}
                                    </TableCell>
                                    <TableCell className="text-sm">{alert.country}</TableCell>
                                    <TableCell>
                                        {alert.blocked ? (
                                            <Badge variant="destructive">Blocked</Badge>
                                        ) : (
                                            <Badge variant="secondary">Allowed</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}