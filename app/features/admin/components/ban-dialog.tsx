"use client";

import { useState } from "react";
import { useBanUser } from "@/app/features/admin/hooks/use-admin-users";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Ban } from "lucide-react";

type BanDialogProps = {
  userId: string;
  userName: string;
  banReason?: string | null;
};

export function BanDialog({ userId, userName, banReason }: BanDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const banUser = useBanUser();

  const handleBan = async () => {
    await banUser.mutateAsync({
      userId,
      banReason: reason || undefined,
      banExpiresIn: expiresInDays ? Number(expiresInDays) * 86400 : undefined,
    });
    setOpen(false);
    setReason("");
    setExpiresInDays("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Ban className="size-4 sm:mr-1" />
            <span className="hidden sm:inline">Ban</span>
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban {userName}</DialogTitle>
          <DialogDescription>This will prevent the user from accessing the platform.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason (optional)
            </label>
            <Input
              id="reason"
              placeholder="e.g. Violation of terms"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="expires" className="text-sm font-medium">
              Auto-unban after (days, optional)
            </label>
            <Input
              id="expires"
              type="number"
              min="1"
              placeholder="e.g. 7"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
            />
          </div>
          {banReason && <p className="text-xs text-text-muted">Previous ban reason: {banReason}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleBan} disabled={banUser.isPending}>
            {banUser.isPending ? "Banning..." : "Ban User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
