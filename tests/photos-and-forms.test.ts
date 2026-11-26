import { describe, expect, it } from "vitest";
import { encodeUnder, fitWithin, isAcceptedType, QUALITY_STEPS, TARGET_BYTES } from "@/lib/images/compress";
import {
  EMPTY_PROPERTY_FORM,
  propertyFormSchema,
  toCreateBody,
  toPatchBody,
} from "@/lib/validation/property";
import { registerSchema } from "@/lib/validation/auth";

describe("photo preparation", () => {
  it("fits the long edge within 1600 px, keeping the aspect ratio, never upscaling", () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000)).toEqual({ width: 1200, height: 1600 });
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("steps quality down until the photo is under the ~3.5 MB target", async () => {
    const tried: number[] = [];
    const sizes = [6_000_000, 4_000_000, 3_000_000];
    const blob = await encodeUnder(async (q) => {
      tried.push(q);
      return new Blob([new Uint8Array(sizes[tried.length - 1] ?? 1)]);
    });
    expect(tried).toEqual(QUALITY_STEPS.slice(0, 3));
    expect(blob?.size).toBe(3_000_000);
    expect(blob!.size).toBeLessThanOrEqual(TARGET_BYTES);
  });

  it("returns the smallest attempt when nothing gets under the target", async () => {
    const blob = await encodeUnder(async (q) => new Blob([new Uint8Array(Math.round(9_000_000 * q))]));
    expect(blob?.size).toBe(Math.round(9_000_000 * QUALITY_STEPS[QUALITY_STEPS.length - 1]!));
  });

  it("only accepts the types the API accepts", () => {
    expect(isAcceptedType("image/jpeg")).toBe(true);
    expect(isAcceptedType("image/webp")).toBe(true);
    expect(isAcceptedType("image/heic")).toBe(false);
    expect(isAcceptedType("image/gif")).toBe(false);
  });
});

const valid = {
  ...EMPTY_PROPERTY_FORM,
  title: "Bedsitter near KU",
  description: "Quiet, water 24/7, near the stage.",
  priceAmount: "12,500",
  area: "Kahawa Wendani",
};

describe("listing form ↔ API body", () => {
  it("mirrors the API's limits", () => {
    expect(propertyFormSchema.safeParse(valid).success).toBe(true);
    const bad = propertyFormSchema.safeParse({ ...valid, title: "ab", priceAmount: "0", bedrooms: "51" });
    expect(bad.success).toBe(false);
    const fields = bad.success ? [] : bad.error.issues.map((i) => i.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["title", "priceAmount", "bedrooms"]));
    expect(propertyFormSchema.safeParse({ ...valid, priceAmount: "100000001" }).success).toBe(false);
    expect(propertyFormSchema.safeParse({ ...valid, amenities: Array(31).fill("x") }).success).toBe(false);
  });

  it("builds a create body: commas stripped, empty optionals omitted, amenities de-duplicated", () => {
    const body = toCreateBody({ ...valid, amenities: ["Parking", "parking ", "CCTV"] });
    expect(body).toMatchObject({ priceAmount: 12500, bedrooms: undefined, addressText: undefined });
    expect(body.amenities).toEqual(["Parking", "CCTV"]);
  });

  it("builds a patch with only changed fields, and null to clear an optional", () => {
    const initial = { ...valid, bedrooms: "1", addressText: "Near Quickmart" };
    expect(toPatchBody(initial, initial)).toEqual({});
    expect(
      toPatchBody({ ...initial, priceAmount: "13,000", bedrooms: "", addressText: "" }, initial),
    ).toEqual({
      priceAmount: 13000,
      bedrooms: null,
      addressText: null,
    });
  });
});

describe("registration form", () => {
  it("requires a role and an 8+ character password", () => {
    const r = registerSchema.safeParse({ name: "A", email: "a@b.test", password: "short" });
    expect(r.success).toBe(false);
    const ok = registerSchema.safeParse({
      role: "TENANT",
      name: " Wanjiru ",
      email: "w@b.test",
      password: "12345678",
    });
    expect(ok.success && ok.data.name).toBe("Wanjiru");
  });
});
