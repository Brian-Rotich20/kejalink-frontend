import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

/** Form-level error, announced when it appears. */
export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-sm border border-danger/40 bg-danger-soft p-3 text-danger"
    >
      <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="grid gap-1 font-bold">{children}</div>
    </div>
  );
}
