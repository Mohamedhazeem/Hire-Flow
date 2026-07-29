"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";
import type { ReactNode } from "react";

export type ConfirmDialogVariant = "destructive" | "warning" | "info";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  isPending?: boolean;
};

const VARIANT_ICONS: Record<ConfirmDialogVariant, typeof AlertTriangleIcon> = {
  destructive: AlertTriangleIcon,
  warning: AlertTriangleIcon,
  info: AlertTriangleIcon,
};

const VARIANT_COLORS: Record<ConfirmDialogVariant, string> = {
  destructive: "text-destructive",
  warning: "text-warning",
  info: "text-primary",
};

const VARIANT_BUTTON: Record<ConfirmDialogVariant, "destructive" | "default" | "secondary"> = {
  destructive: "destructive",
  warning: "default",
  info: "default",
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "destructive",
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const Icon = VARIANT_ICONS[variant];
  const iconColor = VARIANT_COLORS[variant];
  const buttonVariant = VARIANT_BUTTON[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`size-5 ${iconColor}`} />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <DialogClose render={<Button variant="outline">{cancelLabel}</Button>} />
          <Button variant={buttonVariant} onClick={onConfirm} disabled={isPending}>
            {isPending ? `${confirmLabel ?? "Confirm"}...` : (confirmLabel ?? "Confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
