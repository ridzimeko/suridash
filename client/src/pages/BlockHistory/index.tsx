import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";

import { useBlockedIPs } from "@/hooks/use-blocked-ips";
import { blockColumns } from "./table/columns";

import { ConfirmDialog } from "./modals/ConfirmDialog";
import { AddBlockModal } from "./modals/AddBlockModal";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { api } from "@/lib/api";
import type { BlockedIP } from "@/types";

export default function BlockHistory() {
  const { data, refresh } = useBlockedIPs();
  const [searchTerm, setSearchTerm] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedIP, setSelectedIP] = useState<BlockedIP|null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);

  const filtered = data.filter(
    (item) =>
      item.ip.includes(searchTerm) ||
      item.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleUnblock(ip: BlockedIP) {
    setSelectedIP(ip);
    setConfirmOpen(true);
  }

  async function confirmUnblock() {
    const ip = selectedIP?.ip;

    try {
      await api.post(`blocked-ips/${selectedIP?.id}/unblock`);
      toast.success(`Unblocked ${ip}`);
      refresh();
    } catch {
      toast.error("Failed to unblock");
    }

    setConfirmOpen(false);
  }

  async function handleAddBlock({ ip, reason }: { ip: string, reason: string }) {
    try {
      await api.post("blocked-ips", { json: { ip, reason } });
      toast.success(`Blocked ${ip}`);
      refresh();
    } catch {
      toast.error("Failed to block IP");
    }
    setAddModalOpen(false);
  }

  const table = useReactTable({
    data: filtered,
    columns: blockColumns(handleUnblock),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Block History</h1>
          <p className="text-muted-foreground">View and manage blocked IP addresses</p>
        </div>

        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Block
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Search by IP or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked IPs ({filtered.length})</CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Prev
            </Button>

            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>

            <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ConfirmDialog
        open={confirmOpen}
        title="Unblock IP?"
        message={`Are you sure you want to unblock ${selectedIP?.ip}?`}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmUnblock}
      />

      <AddBlockModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddBlock}
      />
    </div>
  );
}
