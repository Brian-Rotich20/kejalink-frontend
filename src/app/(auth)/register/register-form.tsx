"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FormAlert } from "@/components/domain/form-alert";
import { PasswordInput } from "@/components/domain/password-input";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { Field, Input } from "@/components/ui/field";
import { type ApiError, fromAuthError } from "@/lib/api/errors";
import { authClient } from "@/lib/auth/client";
import { landingFor, safeNext } from "@/lib/auth/roles";
import { cn } from "@/lib/cn";
import { type RegisterValues, registerSchema } from "@/lib/validation/auth";

const ROLE_CARDS = [
  {
    value: "SEEKER",
    title: "I'm looking for a place",
    body: "Browse, request viewings and track the answers.",
    icon: Search,
  },
  {
    value: "TENANT",
    title: "I want to list a place",
    body: "For landlords, caretakers, or anyone letting out a room.",
    icon: KeyRound,
  },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "");
  const preset =
    params.get("as") === "tenant" ? "TENANT" : params.get("as") === "seeker" ? "SEEKER" : undefined;
  const [error, setError] = useState<ApiError | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: preset, name: "", email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;
  // Until React hydrates, a native submit would GET the password into the URL; keep the button inert.
  const hydrated = useHydrated();
  const role = useWatch({ control: form.control, name: "role" });

  async function onSubmit(values: RegisterValues) {
    setError(null);
    const result = await authClient.signUp.email({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role,
    });
    if (result.error) {
      setError(fromAuthError(result.error));
      return;
    }
    // Sign-up signs the person in; send them to their area (or back where they came from).
    router.replace(landingFor(values.role, values.role === "SEEKER" ? next || null : null));
    router.refresh();
  }

  return (
    <form noValidate method="post" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
      <fieldset className="grid gap-3" aria-describedby={errors.role ? "role-error" : undefined}>
        <legend className="mb-3 font-bold">What brings you here?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLE_CARDS.map((card) => {
            const checked = role === card.value;
            const Icon = card.icon;
            return (
              <label
                key={card.value}
                className={cn(
                  "relative grid cursor-pointer gap-2 rounded-md border-2 p-4 transition-[border-color,background-color]",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                  checked ? "border-ink bg-surface-2" : "border-line bg-surface-2 hover:border-line-strong",
                )}
              >
                <input type="radio" value={card.value} className="sr-only" {...form.register("role")} />
                <span className="flex items-center justify-between gap-3">
                  <Icon aria-hidden className="size-6" />
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-5 place-items-center rounded-pill border-2",
                      checked ? "border-ink bg-ink" : "border-line-strong",
                    )}
                  >
                    {checked ? <span className="size-2 rounded-pill bg-band" /> : null}
                  </span>
                </span>
                <span className="text-step-1 font-bold">{card.title}</span>
                <span className="text-step--1 text-ink-2">{card.body}</span>
              </label>
            );
          })}
        </div>
        {errors.role ? (
          <p id="role-error" className="text-step--1 font-bold text-danger">
            {errors.role.message}
          </p>
        ) : null}
      </fieldset>

      {error ? (
        <FormAlert>
          <p>{error.message}</p>
          {error.code.startsWith("USER_ALREADY_EXISTS") ? (
            <Link className="link font-bold" href="/login">
              Sign in instead
            </Link>
          ) : null}
        </FormAlert>
      ) : null}

      <Field label="Your name" hint="Shown to the people you deal with." error={errors.name?.message}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            autoComplete="name"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...form.register("name")}
          />
        )}
      </Field>
      <Field label="Email" error={errors.email?.message}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...form.register("email")}
          />
        )}
      </Field>
      <Field label="Password" hint="At least 8 characters." error={errors.password?.message}>
        {({ id, describedBy, invalid }) => (
          <PasswordInput
            id={id}
            autoComplete="new-password"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...form.register("password")}
          />
        )}
      </Field>

      <Button type="submit" variant="band" size="lg" block loading={isSubmitting} disabled={!hydrated}>
        {isSubmitting ? "Creating your account" : "Create account"}
      </Button>
      <p className="text-step--1 text-ink-2">
        By creating an account you agree to the{" "}
        <Link className="link" href="/terms">
          terms
        </Link>{" "}
        and{" "}
        <Link className="link" href="/privacy">
          privacy notice
        </Link>{" "}
        (drafts). Already have an account?{" "}
        <Link className="link font-bold" href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
