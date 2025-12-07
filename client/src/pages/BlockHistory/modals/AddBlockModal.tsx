import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: ({ ip, reason }: { ip: string, reason: string }) => void;
}

export function AddBlockModal({ open, onClose, onSubmit }: Props) {
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block IP Manually</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>IP Address</Label>
            <Input value={ip} onChange={(e) => setIp(e.target.value)} />
          </div>

          <div>
            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSubmit({ ip, reason })}
            disabled={!ip}
          >
            Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
