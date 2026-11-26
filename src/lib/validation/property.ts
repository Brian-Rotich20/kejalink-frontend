import { z } from "zod";
import type { PropertyInput, PropertyPatch } from "@/lib/api/resources";
import type { PropertyDetail } from "@/lib/api/schemas/property";
import { PROPERTY_TYPES } from "@/lib/kenya";

/**
 * The listing form, with the same limits as the API's create/patch schemas:
 * title 3–150, description 10–5000, price > 0 and ≤ 100,000,000, rooms 0–50,
 * county 1–100, area 1–150, address ≤ 255, ≤ 30 amenities of 1–50 characters.
 * Numbers are typed as text (phone keyboards, commas) and converted on submit.
 */
const roomCount = z
  .string()
  .trim()
  .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 50), "Use a whole number from 0 to 50");

export const MAX_AMENITIES = 30;

export const propertyFormSchema = z.object({
  title: z.string().trim().min(3, "Use at least 3 characters").max(150, "Use 150 characters or fewer"),
  propertyType: z.enum(PROPERTY_TYPES, { error: "Choose a type" }),
  description: z
    .string()
    .trim()
    .min(10, "Describe the place in at least 10 characters")
    .max(5000, "Use 5,000 characters or fewer"),
  priceAmount: z
    .string()
    .trim()
    .min(1, "Enter the monthly rent")
    .refine((v) => /^[\d,\s]+$/.test(v), "Whole shillings only, like 12,500")
    .refine((v) => Number(v.replace(/[,\s]/g, "")) > 0, "Rent must be more than 0")
    .refine((v) => Number(v.replace(/[,\s]/g, "")) <= 100_000_000, "That's above the KES 100,000,000 limit"),
  bedrooms: roomCount,
  bathrooms: roomCount,
  county: z.string().trim().min(1, "Choose a county").max(100),
  area: z.string().trim().min(1, "Enter the area, estate or campus").max(150, "Use 150 characters or fewer"),
  addressText: z.string().trim().max(255, "Use 255 characters or fewer"),
  amenities: z
    .array(z.string().trim().min(1).max(50, "Keep each amenity under 50 characters"))
    .max(MAX_AMENITIES, `Up to ${MAX_AMENITIES} amenities`),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const EMPTY_PROPERTY_FORM: PropertyFormValues = {
  title: "",
  propertyType: "BEDSITTER",
  description: "",
  priceAmount: "",
  bedrooms: "",
  bathrooms: "",
  county: "Nairobi",
  area: "",
  addressText: "",
  amenities: [],
};

const money = (v: string) => Number(v.replace(/[,\s]/g, ""));
const optionalInt = (v: string) => (v.trim() === "" ? undefined : Number(v));

export function toFormValues(p: PropertyDetail): PropertyFormValues {
  return {
    title: p.title,
    propertyType: p.propertyType,
    description: p.description,
    priceAmount: String(p.priceAmount),
    bedrooms: p.bedrooms === null ? "" : String(p.bedrooms),
    bathrooms: p.bathrooms === null ? "" : String(p.bathrooms),
    county: p.county,
    area: p.area,
    addressText: p.addressText ?? "",
    amenities: p.amenities,
  };
}

export function toCreateBody(v: PropertyFormValues): PropertyInput {
  const address = v.addressText.trim();
  return {
    title: v.title.trim(),
    propertyType: v.propertyType,
    description: v.description.trim(),
    priceAmount: money(v.priceAmount),
    bedrooms: optionalInt(v.bedrooms),
    bathrooms: optionalInt(v.bathrooms),
    county: v.county.trim(),
    area: v.area.trim(),
    addressText: address || undefined,
    amenities: dedupe(v.amenities),
  };
}

/** Only the fields that changed; cleared optional fields become `null` so the API clears them. */
export function toPatchBody(v: PropertyFormValues, initial: PropertyFormValues): PropertyPatch {
  const body: PropertyPatch = {};
  if (v.title.trim() !== initial.title) body.title = v.title.trim();
  if (v.propertyType !== initial.propertyType) body.propertyType = v.propertyType;
  if (v.description.trim() !== initial.description) body.description = v.description.trim();
  if (money(v.priceAmount) !== money(initial.priceAmount)) body.priceAmount = money(v.priceAmount);
  if (v.bedrooms.trim() !== initial.bedrooms) body.bedrooms = optionalInt(v.bedrooms) ?? null;
  if (v.bathrooms.trim() !== initial.bathrooms) body.bathrooms = optionalInt(v.bathrooms) ?? null;
  if (v.county.trim() !== initial.county) body.county = v.county.trim();
  if (v.area.trim() !== initial.area) body.area = v.area.trim();
  if (v.addressText.trim() !== initial.addressText) body.addressText = v.addressText.trim() || null;
  const amenities = dedupe(v.amenities);
  if (amenities.join("\u0000") !== initial.amenities.join("\u0000")) body.amenities = amenities;
  return body;
}

const dedupe = (list: string[]) => {
  const seen = new Set<string>();
  return list
    .map((a) => a.trim())
    .filter((a) => {
      const key = a.toLowerCase();
      if (!a || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};
