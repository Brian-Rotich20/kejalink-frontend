import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap select-none",
    "rounded-sm transition-[background-color,border-color,color,transform,box-shadow] duration-(--dur-1) ease-out",
    "hover:-translate-y-px active:translate-y-px active:scale-[0.98] motion-reduce:transform-none",
    "disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55",
    "[&_svg]:size-[1.15em] [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** The one primary action in a region: the PSV band. */
        band: "bg-band text-on-band hover:bg-band-hover active:bg-band-press",
        /** Route-board ink. */
        board: "bg-board text-on-board hover:bg-board-2",
        quiet: "border border-line-strong bg-surface-2 text-ink hover:border-ink hover:bg-surface",
        ghost: "text-ink hover:bg-surface-sunk",
        danger: "bg-danger text-white hover:brightness-95",
        "danger-quiet":
          "border border-danger/50 bg-surface-2 text-danger hover:border-danger hover:bg-danger-soft",
      },
      size: {
        sm: "min-h-11 px-3 text-step--1 md:min-h-9",
        md: "min-h-11 px-4 text-step-0",
        lg: "min-h-13 px-6 text-step-1",
        icon: "size-11 p-0",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "quiet", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner, keeps the label for screen readers, and blocks clicks. */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  loading = false,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <Slot.Root className={cn(buttonVariants({ variant, size, block }), className)} {...props}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 aria-hidden className="animate-spin motion-reduce:animate-none" /> : null}
      {children}
    </button>
  );
}
