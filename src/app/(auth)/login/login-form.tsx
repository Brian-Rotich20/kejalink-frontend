"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormAlert } from "@/components/domain/form-alert";
import { PasswordInput } from "@/components/domain/password-input";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { type ApiError, fromAuthError } from "@/lib/api/errors";
import { authClient, useSession } from "@/lib/auth/client";
import { landingFor, ROLE_HOME, safeNext } from "@/lib/auth/roles";
import { supportEmail } from "@/lib/env/public";
import type { UserRole } from "@/lib/api/schemas/common";
import { type SignInValues, signInSchema } from "@/lib/validation/auth";

const asRole = (value: unknown): UserRole =>
  value === "TENANT" || value === "ADMIN" || value === "SEEKER" ? value : "SEEKER";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"), "");
  const session = useSession();
  const [error, setError] = useState<ApiError | null>(null);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: SignInValues) {
    setError(null);
    const result = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: true,
    });
    if (result.error) {
      const normalised = fromAuthError(result.error);
      if (normalised.code === "ACCOUNT_SUSPENDED") {
        router.push("/suspended");
        return;
      }
      setError(normalised);
      return;
    }
    const role = asRole((result.data?.user as { role?: unknown } | undefined)?.role);
    router.replace(landingFor(role, next || null));
    router.refresh();
  }

  const signedIn = session.data?.user;
  if (signedIn) {
    const role = asRole(signedIn.role);
    return (
      <div className="grid gap-4 rounded-md border border-line bg-surface-2 p-5">
        <p>
          You&apos;re signed in as <strong>{signedIn.name}</strong>.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="band">
            <Link href={landingFor(role, next || null)}>Continue</Link>
          </Button>
          <Button
            onClick={async () => {
              await authClient.signOut();
              router.refresh();
            }}
          >
            Sign in as someone else
          </Button>
        </div>
        <p className="text-step--1 text-ink-3">Your home: {ROLE_HOME[role]}</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
      {error ? (
        <FormAlert>
          <p>{error.message}</p>
          {error.code === "TOO_MANY_REQUESTS" ? (
            <p className="font-normal">Sign-in is limited to a few tries a minute to keep accounts safe.</p>
          ) : null}
        </FormAlert>
      ) : null}
      <Field label="Email" error={errors.email?.message}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...form.register("email")}
          />
        )}
      </Field>
      <Field label="Password" error={errors.password?.message}>
        {({ id, describedBy, invalid }) => (
          <PasswordInput
            id={id}
            autoComplete="current-password"
            aria-describedby={describedBy}
            aria-invalid={invalid}
            {...form.register("password")}
          />
        )}
      </Field>
      <Button type="submit" variant="band" size="lg" block loading={isSubmitting}>
        {isSubmitting ? "Signing in" : "Sign in"}
      </Button>
      <div className="grid gap-2 text-step--1 text-ink-2">
        <p>
          New to KejaLink?{" "}
          <Link
            className="link font-bold"
            href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          >
            Create an account
          </Link>
        </p>
        <p>
          Forgotten your password? Password resets aren&apos;t self-service yet.{" "}
          {supportEmail ? (
            <>
              Email{" "}
              <a className="link font-bold" href={`mailto:${supportEmail}?subject=Password%20help`}>
                {supportEmail}
              </a>{" "}
              from the address you signed up with.
            </>
          ) : (
            "Contact KejaLink support from the address you signed up with."
          )}
        </p>
      </div>
    </form>
  );
}
