import { useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch';
// import { Label } from '@/components/ui/label';

import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from '@/components/ui/table';

import dayjs from 'dayjs';
import { Search, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { useBlockedIPs } from '@/hooks/use-blocked-ips';

import { ConfirmDialog } from './ConfirmDialog';
import { AddBlockModal } from './AddBlockModal';
import type { BlockedIP } from '@/types';
import { useAgentStore } from '@/store/agent-store';

export default function BlockHistory() {
  const { selectedAgentId } = useAgentStore();
  const { data: blockedIPs, refresh } = useBlockedIPs(selectedAgentId);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedIP] = useState<BlockedIP|null>(null);
  const [showUnique] = useState(true);

  // Apply unique filter if enabled
  const processedIPs = showUnique
    ? blockedIPs.filter((ip, index, self) =>
        index === self.findIndex((t) => t.ip === ip.ip)
      )
    : blockedIPs;

  const filteredIPs = processedIPs.filter(
    (ip) =>
      ip.ip.includes(searchTerm) ||
      ip.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ----- HANDLE UNBLOCK -----
  // function openUnblockModal(ip: BlockedIP) {
  //   setSelectedIP(ip);
  //   setConfirmOpen(true);
  // }

  async function confirmUnblock() {
    try {
      await api.post(`blocked-ips/${selectedIP?.id}/unblock`);
      toast.success(`IP ${selectedIP?.ip} unblocked`);
      refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log(e);
      toast.error("Failed to unblock IP");
    }

    setConfirmOpen(false);
  }

  // ----- HANDLE ADD BLOCK -----
  async function handleAddBlock({ ip, reason }: { ip: string; reason: string }) {
    try {
      await api.post(`blocked-ips`, {
        json: {
          ip,
          reason,
          attackType: "manual",
          autoBlocked: false,
        },
      });

      toast.success(`IP ${ip} blocked`);
      refresh();
    } catch {
      toast.error("Failed to block IP");
    }

    setAddModalOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Block History</h1>
          <p className="text-muted-foreground">View and manage blocked IP addresses</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <RotateCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search IPs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* <div className="flex items-center gap-2">
              <Switch
                id="unique-ips"
                checked={showUnique}
                onCheckedChange={setShowUnique}
              />
              <Label htmlFor="unique-ips" className="cursor-pointer">
                Show Unique IPs
              </Label>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked IPs ({filteredIPs.length})</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredIPs.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell>
                    {dayjs(ip?.createdAt).format("MMM DD, YYYY HH:mm")}
                  </TableCell>
                  <TableCell className="font-mono">{ip.ip}</TableCell>

                  <TableCell>{ip.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <ConfirmDialog
        open={confirmOpen}
        title="Unblock IP?"
        message={`Are you sure you want to unblock ${selectedIP?.ip}?`}
        onConfirm={confirmUnblock}
        onClose={() => setConfirmOpen(false)}
      />

      <AddBlockModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddBlock}
      />
    </div>
  );
}
