"use client";

import { useState, useCallback, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, type ConfirmDialogVariant } from "@/components/shared/confirm-dialog";

type ConfirmActionButtonProps = {
  action: () => void;
  isPending?: boolean;
  title: string;
  tooltip?: string;
  description: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  dialogVariant?: ConfirmDialogVariant;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
};

export function ConfirmActionButton({
  action,
  isPending = false,
  title,
  tooltip,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  dialogVariant = "destructive",
  variant,
  size,
  disabled,
  className,
  children,
}: ConfirmActionButtonProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    action();
  }, [action]);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        className={className}
        title={tooltip}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        variant={dialogVariant}
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </>
  );
}
