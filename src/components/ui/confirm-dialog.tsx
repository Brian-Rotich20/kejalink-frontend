"use client";

import type { ReactNode } from "react";
import { Button } from "./button";
import { Dialog, DialogClose, DialogContent, DialogFooter } from "./dialog";

/**
 * Confirmation for consequential actions. States the consequence in the body, names the action
 * on the button, and keeps the safe choice first for keyboard users.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  children,
  confirmLabel,
  cancelLabel = "Keep it",
  tone = "danger",
  pending,
  onConfirm,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "band" | "board";
  pending?: boolean;
  onConfirm: () => void;
  error?: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => (pending ? undefined : onOpenChange(next))}>
      <DialogContent title={title}>
        <div className="grid gap-3 text-ink-2">{children}</div>
        {error ? (
          <p role="alert" className="mt-4 rounded-sm bg-danger-soft p-3 font-bold text-danger">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={pending}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button variant={tone} loading={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
