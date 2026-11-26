"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { type FieldPath, useForm, useWatch } from "react-hook-form";
import { FormAlert } from "@/components/domain/form-alert";
import { PropertyPlate } from "@/components/domain/property-plate";
import { Button } from "@/components/ui/button";
import { Field, Input, NativeSelect, Textarea } from "@/components/ui/field";
import { useHydrated } from "@/hooks/use-hydrated";
import { ApiError, messageFor } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatAmount } from "@/lib/format";
import { AMENITY_SUGGESTIONS, COUNTIES, PROPERTY_TYPE_LABEL, PROPERTY_TYPES } from "@/lib/kenya";
import {
  EMPTY_PROPERTY_FORM,
  MAX_AMENITIES,
  type PropertyFormValues,
  propertyFormSchema,
} from "@/lib/validation/property";

const FIELD_NAMES = new Set<string>(Object.keys(EMPTY_PROPERTY_FORM));

type Draft = Partial<PropertyFormValues>;
const openedDrafts = new Map<string, Draft | null>();
const noopSubscribe = () => () => {};

/** Read a saved draft once per form key, so the snapshot stays stable while autosave writes. */
function draftAtOpen(key: string): Draft | null {
  if (!openedDrafts.has(key)) {
    let draft: Draft | null = null;
    try {
      const raw = sessionStorage.getItem(key);
      const parsed = raw ? propertyFormSchema.partial().safeParse(JSON.parse(raw)) : null;
      draft = parsed?.success ? parsed.data : null;
    } catch {
      draft = null; // storage blocked or a corrupt draft: start from the saved listing
    }
    openedDrafts.set(key, draft);
  }
  return openedDrafts.get(key) ?? null;
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <fieldset
      aria-labelledby={id}
      className="grid gap-5 rounded-md border border-line bg-surface-2 p-5 md:p-6"
    >
      <div className="grid gap-1">
        <h2 id={id} className="board-type text-step-2">
          {title}
        </h2>
        {hint ? <p className="text-step--1 text-ink-2">{hint}</p> : null}
      </div>
      {children}
    </fieldset>
  );
}

function AmenityPicker({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const [custom, setCustom] = useState("");
  const inputId = useId();
  const has = (a: string) => value.some((v) => v.toLowerCase() === a.toLowerCase());
  const toggle = (a: string) =>
    onChange(has(a) ? value.filter((v) => v.toLowerCase() !== a.toLowerCase()) : [...value, a]);
  const addCustom = () => {
    const a = custom.trim().slice(0, 50);
    if (a && !has(a) && value.length < MAX_AMENITIES) onChange([...value, a]);
    setCustom("");
  };
  const extras = value.filter((v) => !AMENITY_SUGGESTIONS.some((s) => s.toLowerCase() === v.toLowerCase()));
  return (
    <div className="grid gap-4">
      <ul className="flex flex-wrap gap-2" aria-label="Common amenities">
        {AMENITY_SUGGESTIONS.map((a) => {
          const on = has(a);
          return (
            <li key={a}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(a)}
                disabled={!on && value.length >= MAX_AMENITIES}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-sm border px-3 font-bold transition-colors disabled:opacity-50",
                  on ? "border-ink bg-ink text-surface" : "border-line-strong bg-surface-2 hover:border-ink",
                )}
              >
                {a}
              </button>
            </li>
          );
        })}
      </ul>
      {extras.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Your own amenities">
          {extras.map((a) => (
            <li
              key={a}
              className="inline-flex min-h-11 items-center gap-1 rounded-sm bg-ink pl-3 font-bold text-surface"
            >
              {a}
              <button
                type="button"
                onClick={() => toggle(a)}
                className="grid size-11 place-items-center rounded-sm hover:bg-ink-2"
                aria-label={`Remove ${a}`}
              >
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="grid gap-1.5">
        <label htmlFor={inputId} className="font-bold">
          Add your own
        </label>
        <div className="flex gap-2">
          <Input
            id={inputId}
            value={custom}
            maxLength={50}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="e.g. Rooftop drying line"
          />
          <Button onClick={addCustom} disabled={!custom.trim() || value.length >= MAX_AMENITIES}>
            <Plus aria-hidden />
            Add
          </Button>
        </div>
        <p className="text-step--1 text-ink-3">
          {value.length} of {MAX_AMENITIES}
        </p>
      </div>
      {error ? <p className="text-step--1 font-bold text-danger">{error}</p> : null}
    </div>
  );
}

/**
 * Create / edit a listing. Unsaved input is kept in sessionStorage (a lost connection or a reload
 * on a cheap phone shouldn't cost the person their typing) and restored with a visible notice.
 */
export function PropertyForm({
  draftKey,
  initial = EMPTY_PROPERTY_FORM,
  submitLabel,
  pendingLabel,
  onSubmit,
  error,
  pending,
}: {
  draftKey: string;
  initial?: PropertyFormValues;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (values: PropertyFormValues) => void;
  error: unknown;
  pending: boolean;
}) {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: initial,
  });
  const { errors } = form.formState;
  const values = useWatch({ control: form.control }) as PropertyFormValues;
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);
  const [preview, setPreview] = useState(false);
  const storageKey = `kejalink:draft:${draftKey}`;
  const loaded = useRef(false);
  // The draft as it was when this form opened (later autosaves don't count as "restored").
  const savedDraft = useSyncExternalStore(
    noopSubscribe,
    () => draftAtOpen(storageKey),
    () => null,
  );
  const restored = savedDraft !== null && !dismissed;

  // Put a saved draft back into the form once, after mount (sessionStorage is browser-only).
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    if (savedDraft) form.reset({ ...initial, ...savedDraft }, { keepDefaultValues: true });
  }, [form, initial, savedDraft]);

  // Save the draft as the person types (only when it differs from what's saved).
  useEffect(() => {
    if (!loaded.current) return;
    const timer = setTimeout(() => {
      try {
        if (form.formState.isDirty) sessionStorage.setItem(storageKey, JSON.stringify(values));
        else sessionStorage.removeItem(storageKey);
      } catch {
        // Ignore: drafts are a convenience.
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [values, storageKey, form.formState.isDirty]);

  // Field errors from the API (422 details) land on the matching inputs.
  useEffect(() => {
    if (error instanceof ApiError && error.details) {
      for (const issue of error.details) {
        if (FIELD_NAMES.has(issue.field)) {
          form.setError(issue.field as FieldPath<PropertyFormValues>, { message: issue.message });
        }
      }
    }
  }, [error, form]);

  const discardDraft = () => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    openedDrafts.delete(storageKey);
    form.reset(initial);
    setDismissed(true);
  };

  const submit = form.handleSubmit((v) => {
    try {
      sessionStorage.removeItem(storageKey);
      openedDrafts.delete(storageKey);
    } catch {
      // ignore
    }
    onSubmit(v);
  });

  const price = Number((values.priceAmount ?? "").replace(/[,\s]/g, ""));

  return (
    <form
      noValidate
      method="post"
      onSubmit={submit}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10"
    >
      <div className="grid content-start gap-6">
        {restored ? (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-sm bg-info-soft p-3 text-info"
          >
            <p className="font-bold">We restored your unsaved changes.</p>
            <Button variant="ghost" size="sm" onClick={discardDraft}>
              <RotateCcw aria-hidden />
              Discard them
            </Button>
          </div>
        ) : null}
        {error && !(error instanceof ApiError && error.code === "VALIDATION_ERROR") ? (
          <FormAlert>
            <p>{messageFor(error)}</p>
          </FormAlert>
        ) : null}

        <Section title="The basics">
          <Field
            label="Listing title"
            hint="What would make you click? e.g. “Bedsitter near KU main gate”"
            error={errors.title?.message}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                maxLength={150}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("title")}
              />
            )}
          </Field>
          <Field label="Type of place" error={errors.propertyType?.message}>
            {({ id, describedBy, invalid }) => (
              <NativeSelect
                id={id}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("propertyType")}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PROPERTY_TYPE_LABEL[t]}
                  </option>
                ))}
              </NativeSelect>
            )}
          </Field>
        </Section>

        <Section
          title="Where it is"
          hint="Seekers search by county and area. The address is optional; share a landmark rather than a house number."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="County" error={errors.county?.message}>
              {({ id, describedBy, invalid }) => (
                <NativeSelect
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  {...form.register("county")}
                >
                  {COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </Field>
            <Field label="Area, estate or campus" error={errors.area?.message}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  maxLength={150}
                  placeholder="e.g. Kahawa Wendani"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  {...form.register("area")}
                />
              )}
            </Field>
          </div>
          <Field label="Directions or landmark" optional error={errors.addressText?.message}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                maxLength={255}
                placeholder="e.g. Behind Quickmart, off Thika Road"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("addressText")}
              />
            )}
          </Field>
        </Section>

        <Section title="Rent and rooms">
          <Field
            label="Rent per month (KES)"
            hint="Whole shillings, no decimals."
            error={errors.priceAmount?.message}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                inputMode="numeric"
                placeholder="12,500"
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("priceAmount")}
              />
            )}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Bedrooms"
              optional
              hint="0 for a bedsitter or studio."
              error={errors.bedrooms?.message}
            >
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  inputMode="numeric"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  {...form.register("bedrooms")}
                />
              )}
            </Field>
            <Field label="Bathrooms" optional error={errors.bathrooms?.message}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  inputMode="numeric"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  {...form.register("bathrooms")}
                />
              )}
            </Field>
          </div>
        </Section>

        <Section
          title="Describe it"
          hint="Water, power, security, how far the stage is, who it suits. Honest beats fancy."
        >
          <Field label="Description" error={errors.description?.message}>
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                rows={7}
                maxLength={5000}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                {...form.register("description")}
              />
            )}
          </Field>
        </Section>

        <Section title="What's included">
          <AmenityPicker
            value={values.amenities ?? []}
            onChange={(next) => form.setValue("amenities", next, { shouldDirty: true, shouldValidate: true })}
            error={errors.amenities?.message ?? errors.amenities?.find?.((e) => e?.message)?.message}
          />
        </Section>
      </div>

      <aside className="grid content-start gap-4 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <Button
          variant="ghost"
          onClick={() => setPreview((p) => !p)}
          aria-expanded={preview}
          className="justify-self-start lg:hidden"
        >
          {preview ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          {preview ? "Hide preview" : "Preview the card"}
        </Button>
        <div className={cn("grid gap-2", !preview && "max-lg:hidden")}>
          <p className="text-step--1 font-bold text-ink-2">How it looks in search</p>
          <PropertyPlate
            property={{
              id: "00000000-0000-4000-8000-000000000000",
              tenantId: "",
              title: values.title?.trim() || "Your listing title",
              propertyType: values.propertyType ?? "BEDSITTER",
              priceAmount: Number.isFinite(price) && price > 0 ? price : 0,
              priceCurrency: "KES",
              bedrooms: values.bedrooms ? Number(values.bedrooms) : null,
              bathrooms: values.bathrooms ? Number(values.bathrooms) : null,
              county: values.county || "County",
              area: values.area?.trim() || "Area",
              isAvailable: true,
              primaryImageUrl: null,
              createdAt: new Date(0).toISOString(),
            }}
            href="#preview"
            headingLevel="h2"
          />
          {price > 0 ? <p className="text-step--1 text-ink-3">KES {formatAmount(price)} a month</p> : null}
        </div>
        <Button type="submit" variant="band" size="lg" block loading={pending} disabled={!hydrated}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </aside>
    </form>
  );
}
