import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to KejaLink to request viewings or manage your listings.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <>
      <div className="grid gap-2">
        <h1 className="board-type text-step-5">Karibu tena</h1>
        <p className="text-ink-2">Sign in to request viewings, or to answer requests for your place.</p>
      </div>
      <Suspense fallback={<Skeleton className="h-80" />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
