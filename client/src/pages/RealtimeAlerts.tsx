import { useState, useMemo, useEffect } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState
} from '@tanstack/react-table';
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
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    RefreshCw,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

import dayjs from 'dayjs';
import type { SeverityLevel, Alert } from '@/types';
import { useAlertStore } from '@/store/alert-store';
import { useAgentStore } from '@/store/agent-store';

// Define columns for the table
const columns: ColumnDef<Alert>[] = [
    {
        accessorKey: 'createdAt',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="p-0 hover:bg-transparent"
                >
                    Time
                    {column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const createdAt = row.getValue('createdAt') as string;
            return (
                <div className="font-mono text-xs">
                    {dayjs(createdAt).format('MMM DD, YYYY HH:mm:ss')}
                </div>
            );
        },
        sortingFn: 'datetime',
    },
    // {
    //     accessorKey: 'signatureId',
    //     header: 'Signature ID',
    //     cell: ({ row }) => (
    //         <div className="text-sm">{row.getValue('signatureId')}</div>
    //     ),
    // },
    {
        accessorKey: 'signature',
        header: 'Signature',
        cell: ({ row }) => {
            const signature = row.getValue('signature') as string;
            return (
                <div className="max-w-xs truncate text-sm" title={signature}>
                    {signature}
                </div>
            );
        },
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue('category')}</div>
        ),
    },
    {
        accessorKey: 'srcIp',
        header: 'Source IP',
        cell: ({ row }) => (
            <div className="font-mono text-xs">{row.getValue('srcIp')}</div>
        ),
    },
    {
        accessorKey: 'severity',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="p-0 hover:bg-transparent"
                >
                    Severity
                    {column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                    ) : column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="ml-2 h-4 w-4" />
                    ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                </Button>
            );
        },
        cell: ({ row }) => {
            const severity = row.getValue('severity') as number;
            const getSeverityLabel = (severity: number): SeverityLevel => {
                switch (severity) {
                    case 1:
                        return 'high';
                    case 2:
                        return 'medium';
                }
                return 'low';
            };
            const severityLabel = getSeverityLabel(severity);
            const getSeverityColor = (severity: SeverityLevel) => {
                switch (severity) {
                    case 'high':
                        return 'bg-red-500 hover:bg-red-600';
                    case 'medium':
                        return 'bg-orange-500 hover:bg-orange-600';
                    case 'low':
                        return 'bg-blue-500 hover:bg-blue-600';
                    default:
                        return 'bg-gray-500 hover:bg-gray-600';
                }
            };

            return (
                <Badge className={getSeverityColor(severityLabel)}>
                    {severityLabel.charAt(0).toUpperCase() + severityLabel.slice(1)}
                </Badge>
            );
        },
        sortingFn: (rowA, rowB, columnId) => {
            const order = { high: 1, medium: 2, low: 3 };
            const a = order[rowA.getValue(columnId) as SeverityLevel] || 0;
            const b = order[rowB.getValue(columnId) as SeverityLevel] || 0;
            return a > b ? 1 : a < b ? -1 : 0;
        },
    },
    {
        accessorKey: 'alertCount',
        header: 'Alerts Count',
        cell: ({ row }) => (
            <Badge variant="secondary">{row.getValue('alertCount')}</Badge>
        ),
    },
];

export default function RealtimeAlerts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string>('all');
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'createdAt', desc: true } // Default sort by latest first
    ]);

    const { selectedAgentId } = useAgentStore();
    const { alerts, loadAlerts } = useAlertStore();

    // Fetch historical data on mount
    useEffect(() => {
        loadAlerts(selectedAgentId);
    }, [loadAlerts, selectedAgentId]);

    // Apply filters before passing to table
    const filteredData = useMemo(() => {
        const severityMap: Record<string, SeverityLevel> = {
            1: 'high',
            2: 'medium',
            3: 'low'
        };

        return alerts.filter((alert) => {
            const matchesAgent = !selectedAgentId || alert.agentId === selectedAgentId;
            const matchesSearch =
                alert.srcIp.includes(searchTerm) ||
                alert.destIp.includes(searchTerm) ||
                alert.signature.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSeverity =
                severityFilter === 'all' || severityMap[alert.severity] === severityFilter;
            return matchesAgent && matchesSearch && matchesSeverity;
        });
    }, [alerts, searchTerm, severityFilter, selectedAgentId]);

    // Configure table
    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
        initialState: {
            pagination: {
                pageSize: 20, // Default page size
                pageIndex: 0,
            },
        },
    });

    // Handle page size change
    const handlePageSizeChange = (value: string) => {
        table.setPageSize(Number(value));
    };

    // // Handle export
    // const handleExport = () => {
    //     const headers = ['Time', 'Severity', 'Category', 'Signature', 'Source IP', 'Dest IP', 'Country', 'Status'];
    //     const csvContent = [
    //         headers.join(','),
    //         ...filteredData.map(alert => [
    //             dayjs(alert.timestamp).format('YYYY-MM-DD HH:mm:ss'),
    //             alert.severity,
    //             alert.category,
    //             `"${alert.signature.replace(/"/g, '""')}"`,
    //             alert.srcIp,
    //             alert.destIp,
    //             alert.country || 'N/A',
    //             alert.blocked ? 'Blocked' : 'Allowed'
    //         ].join(','))
    //     ].join('\n');

    //     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    //     const link = document.createElement('a');
    //     const url = URL.createObjectURL(blob);
    //     link.setAttribute('href', url);
    //     link.setAttribute('download', `alerts-${dayjs().format('YYYY-MM-DD-HHmmss')}.csv`);
    //     link.style.visibility = 'hidden';
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    // };

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
                    <div className="flex gap-2">
                        <Button onClick={() => loadAlerts(selectedAgentId)} variant="outline">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
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
                        <Select value={severityFilter.toString()} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severities</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        Alerts ({filteredData.length})
                        {table.getFilteredRowModel().rows.length !== filteredData.length && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                (Showing {table.getFilteredRowModel().rows.length} filtered of {filteredData.length})
                            </span>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Show</span>
                        <Select
                            value={table.getState().pagination.pageSize.toString()}
                            onValueChange={handlePageSizeChange}
                        >
                            <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="20" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">per page</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && 'selected'}
                                            className="hover:bg-muted/50"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            {alerts.length === 0
                                                ? 'No alerts received yet'
                                                : 'No alerts match your filters'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {table.getPageCount() > 1 && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Page {table.getState().pagination.pageIndex + 1} of{' '}
                                {table.getPageCount()}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                                        let pageIndex;
                                        const currentPage = table.getState().pagination.pageIndex;
                                        const totalPages = table.getPageCount();

                                        if (totalPages <= 5) {
                                            pageIndex = i;
                                        } else if (currentPage <= 2) {
                                            pageIndex = i;
                                        } else if (currentPage >= totalPages - 3) {
                                            pageIndex = totalPages - 5 + i;
                                        } else {
                                            pageIndex = currentPage - 2 + i;
                                        }

                                        return (
                                            <Button
                                                key={pageIndex}
                                                variant={
                                                    table.getState().pagination.pageIndex === pageIndex
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() => table.setPageIndex(pageIndex)}
                                            >
                                                {pageIndex + 1}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Showing {table.getRowModel().rows.length} of{' '}
                                {table.getFilteredRowModel().rows.length} rows
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}