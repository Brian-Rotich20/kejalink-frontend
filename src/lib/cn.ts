import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** Teach tailwind-merge the fluid type steps, so `text-step-*` is a size and never eats a colour class. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["step--3", "step--2", "step--1", "step-0", "step-1", "step-2", "step-3", "step-4", "step-5", "step-6"],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
