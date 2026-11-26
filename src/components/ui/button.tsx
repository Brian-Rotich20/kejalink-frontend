import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const primary = "bg-forest text-on-forest hover:bg-forest-hover active:bg-forest-press";
const secondary = "border border-line-strong bg-paper text-ink hover:border-ink";

export const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none",
    "rounded-sm transition-[background-color,border-color,color,scale] duration-(--dur-1) ease-out",
    "active:scale-[0.98] motion-reduce:active:scale-100",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:size-[1.1em] [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** The main action in a region: forest. */
        primary,
        /** Everything else that matters: an ivory button with a firm outline. */
        secondary,
        ghost: "text-ink hover:bg-sunk",
        danger: "bg-danger text-paper hover:brightness-95",
        "danger-quiet":
          "border border-danger/45 bg-paper text-danger hover:border-danger hover:bg-danger-soft",
        /** @deprecated transitional alias of `primary` */
        band: primary,
        /** @deprecated transitional alias of `secondary` */
        board: secondary,
        /** @deprecated transitional alias of `secondary` */
        quiet: secondary,
      },
      size: {
        sm: "min-h-11 px-3 text-step--1 md:min-h-9",
        md: "min-h-11 px-4 text-step-0",
        lg: "min-h-12 px-5 text-step-0",
        icon: "size-11 p-0",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "secondary", size: "md" },
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
