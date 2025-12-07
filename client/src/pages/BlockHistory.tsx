import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockBlockedIPs } from '@/lib/mockData';
import dayjs from 'dayjs';
import { Search, Unlock } from 'lucide-react';
import { toast } from 'sonner';

export default function BlockHistory() {
  const [blockedIPs, setBlockedIPs] = useState(mockBlockedIPs);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIPs = blockedIPs.filter(
    (ip) =>
      ip.ip.includes(searchTerm) ||
      ip.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnblock = (id: string) => {
    setBlockedIPs(blockedIPs.filter((ip) => ip.id !== id));
    toast.success('IP address unblocked successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Block History</h1>
        <p className="text-muted-foreground">
          View and manage blocked IP addresses
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Blocked IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by IP or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked IPs ({filteredIPs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Blocked At</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Alert Count</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIPs.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell className="font-mono">{ip.ip}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{ip.countryCode}</span>
                      <span>{ip.country}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {ip.reason}
                  </TableCell>
                  <TableCell className="text-sm">
                    {dayjs(ip.blockedAt).format('MMM DD, YYYY HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ip.duration === 'Permanent' ? 'destructive' : 'secondary'
                      }
                    >
                      {ip.duration}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {ip.alertCount}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(ip.id)}
                    >
                      <Unlock className="mr-2 h-4 w-4" />
                      Unblock
                    </Button>
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