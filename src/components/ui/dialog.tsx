"use client";

import { X } from "lucide-react";
import { Dialog as D } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

type ContentProps = ComponentProps<typeof D.Content> & {
  title: ReactNode;
  description?: ReactNode;
  /** "sheet" docks to the bottom on phones (thumb reach) and centres on desktop. */
  variant?: "dialog" | "sheet";
  hideClose?: boolean;
};

/** Focus is trapped inside and restored to the trigger on close (Radix). */
export function DialogContent({
  title,
  description,
  variant = "dialog",
  hideClose,
  className,
  children,
  ...props
}: ContentProps) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-(--scrim) data-[state=closed]:animate-[fade-out_var(--dur-1)_ease-in] data-[state=open]:animate-[fade-in_var(--dur-2)_var(--ease-out)]" />
      <D.Content
        className={cn(
          "fixed z-50 flex max-h-[min(90dvh,48rem)] w-full flex-col bg-paper text-ink shadow-2 outline-none",
          variant === "sheet"
            ? "inset-x-0 bottom-0 rounded-t-md pb-[env(safe-area-inset-bottom)] data-[state=closed]:animate-[sheet-out_var(--dur-2)_ease-in] data-[state=open]:animate-[sheet-in_var(--dur-3)_var(--ease-out)] md:inset-auto md:top-1/2 md:left-1/2 md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md md:data-[state=open]:animate-[dialog-in_var(--dur-2)_var(--ease-out)]"
            : "top-1/2 left-1/2 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-md data-[state=closed]:animate-[fade-out_var(--dur-1)_ease-in] data-[state=open]:animate-[dialog-in_var(--dur-2)_var(--ease-out)] sm:max-w-lg",
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-4 border-b border-line px-5 pt-5 pb-4">
          {variant === "sheet" ? (
            <span
              aria-hidden
              className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-pill bg-line md:hidden"
            />
          ) : null}
          <div className="grid flex-1 gap-1">
            <D.Title className="headline text-step-3">{title}</D.Title>
            {description ? <D.Description className="text-ink-2">{description}</D.Description> : null}
          </div>
          {hideClose ? null : (
            <D.Close className="-m-2 grid size-11 shrink-0 place-items-center rounded-sm text-ink-2 hover:bg-sunk hover:text-ink">
              <X aria-hidden className="size-5" />
              <span className="sr-only">Close</span>
            </D.Close>
          )}
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </D.Content>
    </D.Portal>
  );
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}
