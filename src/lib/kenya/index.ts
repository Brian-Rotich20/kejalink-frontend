/** The 47 counties of Kenya (Constitution, First Schedule), Nairobi first for launch. */
export const COUNTIES = [
  "Nairobi",
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
] as const;

export type County = (typeof COUNTIES)[number];

export const isCounty = (value: string): value is County => (COUNTIES as readonly string[]).includes(value);

export const PROPERTY_TYPES = ["BEDSITTER", "STUDIO", "APARTMENT", "ROOM", "HOUSE", "OTHER"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const isPropertyType = (value: string): value is PropertyType =>
  (PROPERTY_TYPES as readonly string[]).includes(value);

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  BEDSITTER: "Bedsitter",
  STUDIO: "Studio",
  APARTMENT: "Apartment",
  ROOM: "Room",
  HOUSE: "House",
  OTHER: "Other",
};

/** Suggestions only (the API takes free text). Common amenities in Nairobi listings. */
export const AMENITY_SUGGESTIONS = [
  "Water 24/7",
  "Borehole",
  "Token electricity",
  "Wi-Fi ready",
  "Parking",
  "Security guard",
  "CCTV",
  "Gated",
  "Balcony",
  "Tiled floors",
  "Fitted kitchen",
  "Hot shower",
  "Backup generator",
  "Near the stage",
  "Furnished",
  "Pets allowed",
] as const;

/**
 * "Additional conveniences" offered as filters (reference R1). Each must match a suggestion above
 * word for word: the API compares amenities exactly, ignoring case.
 */
export const AMENITY_FILTERS = [
  "Parking",
  "Water 24/7",
  "Security guard",
  "Gated",
  "Wi-Fi ready",
  "Furnished",
  "Pets allowed",
  "Balcony",
] as const satisfies readonly (typeof AMENITY_SUGGESTIONS)[number][];

/** Budget presets for the hero search (KES per month). */
export const BUDGET_STEPS = [5_000, 8_000, 10_000, 15_000, 20_000, 30_000, 50_000, 80_000] as const;
