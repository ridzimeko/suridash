import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AddBlockModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { ip: string; reason: string }) => void;
}

export function AddBlockModal({ open, onClose, onSubmit }: AddBlockModalProps) {
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!ip.trim()) return;
    onSubmit({ ip, reason });
    setIp("");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block IP Manually</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>IP Address</Label>
            <Input
              placeholder="e.g. 192.168.0.10"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
            />
          </div>

          <div>
            <Label>Reason</Label>
            <Input
              placeholder="Optional reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!ip.trim()} onClick={handleSubmit}>
            Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
