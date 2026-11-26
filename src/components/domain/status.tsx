import { Ban, CircleCheck, CircleDashed, CircleX, Clock, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
export type PropertyStatus = "PUBLISHED" | "REJECTED";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

type Tone = { label: string; icon: LucideIcon; className: string };

export const BOOKING_STATUS: Record<BookingStatus, Tone> = {
  PENDING: { label: "Pending", icon: Clock, className: "bg-warning-soft text-warning" },
  CONFIRMED: { label: "Confirmed", icon: CircleCheck, className: "bg-success-soft text-success" },
  REJECTED: { label: "Declined", icon: CircleX, className: "bg-danger-soft text-danger" },
  CANCELLED: {
    label: "Cancelled",
    icon: Ban,
    className: "bg-(--status-cancelled-soft) text-(--status-cancelled)",
  },
};

export const PROPERTY_STATUS: Record<PropertyStatus, Tone> = {
  PUBLISHED: { label: "Live", icon: CircleCheck, className: "bg-success-soft text-success" },
  REJECTED: { label: "Taken down", icon: EyeOff, className: "bg-danger-soft text-danger" },
};

export const USER_STATUS: Record<UserStatus, Tone> = {
  ACTIVE: { label: "Active", icon: CircleCheck, className: "bg-success-soft text-success" },
  SUSPENDED: { label: "Suspended", icon: CircleDashed, className: "bg-warning-soft text-warning" },
  BANNED: { label: "Banned", icon: Ban, className: "bg-danger-soft text-danger" },
};

/** Status is always label + icon + colour, never colour alone. */
export function StatusPlate({ tone, className }: { tone: Tone; className?: string }) {
  const Icon = tone.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs px-2 py-1 text-step--1 leading-none font-bold whitespace-nowrap",
        tone.className,
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" strokeWidth={2.5} />
      {tone.label}
    </span>
  );
}

export const BookingStatusPlate = ({ status, className }: { status: BookingStatus; className?: string }) => (
  <StatusPlate tone={BOOKING_STATUS[status]} className={className} />
);
export const PropertyStatusPlate = ({
  status,
  className,
}: {
  status: PropertyStatus;
  className?: string;
}) => <StatusPlate tone={PROPERTY_STATUS[status]} className={className} />;
export const UserStatusPlate = ({ status, className }: { status: UserStatus; className?: string }) => (
  <StatusPlate tone={USER_STATUS[status]} className={className} />
);

/**
 * A taken place stays visible, plated "Taken", instead of vanishing. Filled dot = room;
 * hollow dot = full. `ground="board"` is for plates set on an ink route board.
 */
export function AvailabilityPlate({
  available,
  className,
  ground = "light",
}: {
  available: boolean;
  className?: string;
  ground?: "light" | "board";
}) {
  const tone =
    ground === "board"
      ? available
        ? "bg-on-board text-board"
        : "text-on-board-2 ring-1 ring-board-line"
      : available
        ? "bg-surface-2 text-ink ring-1 ring-ink"
        : "bg-board text-on-board";
  const dot =
    ground === "board"
      ? available
        ? "bg-board"
        : "border border-on-board-2"
      : available
        ? "bg-ink"
        : "border border-on-board-2";
  return (
    <span
      className={cn(
        "board-type-wide inline-flex items-center gap-1.5 rounded-xs px-2 py-1 text-[0.8125rem] leading-none whitespace-nowrap",
        tone,
        className,
      )}
    >
      <span aria-hidden className={cn("size-2 rounded-pill", dot)} />
      {available ? "Available" : "Taken"}
    </span>
  );
}
