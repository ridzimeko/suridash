import type { ColumnDef } from "@tanstack/react-table";
import type { BlockedIP } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

export const blockColumns = (
  onUnblock: (ip: BlockedIP) => void
): ColumnDef<BlockedIP>[] => [
  {
    accessorKey: "ip",
    header: "IP Address",
    cell: ({ row }) => <code>{row.original.ip}</code>,
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        {row.original.countryCode} {row.original.country}
      </span>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="max-w-xs truncate block">{row.original.reason}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Blocked At",
    cell: ({ row }) =>
      dayjs(row.original.createdAt).format("MMM DD, YYYY HH:mm"),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.duration === "Permanent" ? "destructive" : "secondary"
        }
      >
        {row.original.duration}
      </Badge>
    ),
  },
  {
    accessorKey: "alertCount",
    header: "Alerts",
    cell: ({ row }) => <b>{row.original.alertCount}</b>,
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onUnblock(row.original)}
      >
        Unblock
      </Button>
    ),
  },
];
