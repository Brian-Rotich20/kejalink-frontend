import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

const control =
  "block w-full min-h-11 rounded-sm border border-line-strong bg-surface-2 px-3 text-ink placeholder:text-ink-3 " +
  "transition-[border-color,box-shadow] duration-(--dur-1) hover:border-ink focus-visible:border-focus " +
  "focus-visible:outline-2 focus-visible:outline-offset-0 aria-invalid:border-danger aria-invalid:outline-danger " +
  "disabled:cursor-not-allowed disabled:bg-surface-sunk disabled:text-ink-3";

export const controlClass = control;

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-2.5 leading-relaxed", className)} {...props} />;
}

export function NativeSelect({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        control,
        "appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23252a36' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | undefined;
  optional?: boolean;
  className?: string;
  /** Receives the ids to wire into the control. */
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
};

/** Label above, hint below the label, error below the control; all wired by id. */
export function Field({ label, hint, error, optional, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="font-bold text-ink">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-ink-3">(optional)</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="-mt-1 text-step--1 text-ink-3">
          {hint}
        </p>
      ) : null}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} className="text-step--1 font-bold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
