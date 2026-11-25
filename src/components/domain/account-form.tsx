"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { messageFor } from "@/lib/api/errors";
import { getMe, keys, updateMe } from "@/lib/api/resources";
import { authClient } from "@/lib/auth/client";
import { supportEmail } from "@/lib/env/public";
import { formatDate } from "@/lib/format";
import { type ProfileValues, profileSchema } from "@/lib/validation/auth";
import { FormAlert } from "./form-alert";
import { ListLoading, QueryError } from "./query-states";

const ROLE_NAME = {
  SEEKER: "Looking for a place",
  TENANT: "Listing places",
  ADMIN: "Administrator",
} as const;

/** Name is the only editable field in V1 (no avatar upload, no email change). */
export function AccountForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: keys.me, queryFn: getMe });
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: "" } });
  const { reset } = form;

  useEffect(() => {
    if (me.data) reset({ name: me.data.data.name });
  }, [me.data, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileValues) => updateMe({ name: values.name.trim() }),
    onSuccess: async ({ data }) => {
      queryClient.setQueryData(keys.me, { data, meta: null });
      form.reset({ name: data.name });
      // The header reads the Better Auth session; refresh it so the new name shows everywhere.
      await authClient.getSession({ query: { disableCookieCache: true } });
      router.refresh();
      toast.success("Name updated");
    },
  });

  if (me.isPending) return <ListLoading rows={2} />;
  if (me.isError)
    return <QueryError error={me.error} retry={() => void me.refetch()} retrying={me.isFetching} />;
  const user = me.data.data;

  return (
    <div className="grid max-w-xl gap-8">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} size="lg" />
        <div className="grid gap-0.5">
          <p className="text-step-1 font-bold">{user.name}</p>
          <p className="text-ink-2">
            {ROLE_NAME[user.role]} · joined {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      <form
        noValidate
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="grid gap-5"
      >
        {mutation.error ? (
          <FormAlert>
            <p>{messageFor(mutation.error)}</p>
          </FormAlert>
        ) : null}
        <Field
          label="Your name"
          hint="Shown to the people you deal with."
          error={form.formState.errors.name?.message}
        >
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
        <Field label="Email" hint="Your sign-in address. It can't be changed yet.">
          {({ id, describedBy }) => (
            <Input id={id} value={user.email} readOnly disabled aria-describedby={describedBy} />
          )}
        </Field>
        <div>
          <Button
            type="submit"
            variant="board"
            loading={mutation.isPending}
            disabled={!form.formState.isDirty}
          >
            Save name
          </Button>
        </div>
      </form>

      <div className="grid gap-3 border-t border-line pt-6">
        <p className="text-ink-2">
          Your initials stand in for a profile photo. Need to change your email or delete your account?{" "}
          {supportEmail ? (
            <a className="link font-bold" href={`mailto:${supportEmail}?subject=Account%20request`}>
              Email {supportEmail}
            </a>
          ) : (
            "Contact KejaLink support."
          )}
        </p>
        <div>
          <Button
            onClick={async () => {
              await authClient.signOut();
              queryClient.clear();
              router.push("/");
              router.refresh();
            }}
          >
            <LogOut aria-hidden />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
