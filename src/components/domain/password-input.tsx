"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { Input } from "@/components/ui/field";

/** Password with a show/hide toggle (typing on a phone keyboard is error-prone). */
export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        className="absolute top-0 right-0 grid size-11 place-items-center rounded-sm text-ink-2 hover:text-ink"
      >
        {visible ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
        <span className="sr-only">{visible ? "Hide password" : "Show password"}</span>
      </button>
    </div>
  );
}
