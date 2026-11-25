import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join KejaLink to find a place to rent in Nairobi, or to list yours.",
};

export default function RegisterPage() {
  return (
    <>
      <div className="grid gap-2">
        <h1 className="board-type text-step-5">Karibu KejaLink</h1>
        <p className="text-ink-2">One account, a minute to set up.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[32rem]" />}>
        <RegisterForm />
      </Suspense>
    </>
  );
}
