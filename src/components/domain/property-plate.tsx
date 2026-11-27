import { Bath, BedDouble, Building2, House, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SaveButton } from "@/components/domain/save-button";
import type { PropertyListItem } from "@/lib/api/schemas/property";
import { cn } from "@/lib/cn";
import { cropTo } from "@/lib/cloudinary";
import { formatAmount, formatRelative } from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/lib/kenya";

/** Bedrooms in words people use: a bedsitter or studio is "0 bedrooms" in the data. */
export function bedsLabel(bedrooms: number | null, type: PropertyListItem["propertyType"]): string | null {
  if (bedrooms === null) return null;
  if (bedrooms === 0) return type === "BEDSITTER" || type === "STUDIO" ? null : "No bedroom";
  return `${bedrooms} bed`;
}

/** "Studio, 1 bath" / "Apartment, 2 bed, 2 bath": the room facts as one line. */
export function factsLine(p: Pick<PropertyListItem, "propertyType" | "bedrooms" | "bathrooms">): string {
  const parts: string[] = [PROPERTY_TYPE_LABEL[p.propertyType]];
  const beds = bedsLabel(p.bedrooms, p.propertyType);
  if (beds) parts.push(beds);
  if (p.bathrooms !== null) parts.push(`${p.bathrooms} bath`);
  return parts.join(", ");
}

/**
 * Aspect-locked photo frame (no layout shift). With no photo, a quiet placeholder names the area
 * instead of an empty grey box.
 */
export function PhotoFrame({
  src,
  alt,
  sizes,
  priority = false,
  className,
  aspect = "4:3",
  emptyLabel,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  aspect?: "4:3" | "3:2" | "1:1";
  /** Shown in the frame when there is no photo (usually the area). */
  emptyLabel?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-sunk",
        aspect === "4:3" ? "aspect-[4/3]" : aspect === "3:2" ? "aspect-[3/2]" : "aspect-square",
        className,
      )}
    >
      {src ? (
        <Image
          src={cropTo(src, aspect === "1:1" ? "4:3" : aspect)}
          alt={alt}
          fill
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-content-center justify-items-center gap-1 p-3 text-center text-ink-2">
          <House aria-hidden className="size-6" />
          <span className="text-step--2 font-medium">{emptyLabel ? `${emptyLabel}: no photos yet` : "No photos yet"}</span>
        </div>
      )}
    </div>
  );
}

/** Icon + number chips (R1: light grey, beds and baths). */
function FactChips({ property, className }: { property: PropertyListItem; className?: string }) {
  const beds = bedsLabel(property.bedrooms, property.propertyType);
  return (
    <ul className={cn("flex flex-wrap gap-1.5 text-step--2 text-ink-2", className)}>
      <li className="inline-flex items-center gap-1.5 rounded-xs bg-sunk px-2 py-1">
        <Building2 aria-hidden className="size-3.5 text-ink-3" />
        {PROPERTY_TYPE_LABEL[property.propertyType]}
      </li>
      {beds ? (
        <li className="inline-flex items-center gap-1.5 rounded-xs bg-sunk px-2 py-1">
          <BedDouble aria-hidden className="size-3.5 text-ink-3" />
          {beds}
        </li>
      ) : null}
      {property.bathrooms !== null ? (
        <li className="inline-flex items-center gap-1.5 rounded-xs bg-sunk px-2 py-1">
          <Bath aria-hidden className="size-3.5 text-ink-3" />
          {property.bathrooms} bath
        </li>
      ) : null}
    </ul>
  );
}

function Price({ amount, size = "md" }: { amount: number; size?: "md" | "lg" }) {
  return (
    <p className="whitespace-nowrap text-primary">
      <span className={cn("figure", size === "lg" ? "text-step-1" : "text-step-0")}>KES {formatAmount(amount)}</span>
      <span className="text-step--2 font-medium">/month</span>
    </p>
  );
}

function TakenLabel() {
  return (
    <span className="absolute top-2 left-2 rounded-xs bg-paper px-2 py-0.5 text-step--2 font-semibold text-ink shadow-1">
      Taken
    </span>
  );
}

const stretched =
  "outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus";

type PlateProps = {
  property: PropertyListItem;
  /** Image priority for the first row (LCP). */
  priority?: boolean;
  /** Kept for API compatibility. */
  index?: number;
  sizes?: string;
  href?: string;
  /** Extra content under the facts (dashboards add status and actions). */
  footer?: ReactNode;
  headingLevel?: "h2" | "h3";
  /** The bookmark (seekers and signed-out visitors only). */
  showSave?: boolean;
};

/**
 * Grid card (reference R3): photo on top, green price, title with how long ago it was listed, then
 * a hairline and the facts row. The whole card is one link; the bookmark sits above it.
 */
export function PropertyPlate({
  property,
  priority = false,
  sizes = "(min-width: 1280px) 300px, (min-width: 640px) 45vw, 100vw",
  href = `/properties/${property.id}`,
  footer,
  headingLevel: Heading = "h3",
  showSave = true,
}: PlateProps) {
  return (
    <article className="group relative grid content-start overflow-hidden rounded-md border border-line bg-paper shadow-1 transition-shadow hover:shadow-2">
      <div className="relative">
        <PhotoFrame
          src={property.primaryImageUrl}
          alt=""
          sizes={sizes}
          priority={priority}
          aspect="3:2"
          emptyLabel={property.area}
          className={cn(!property.isAvailable && "[&_img]:opacity-70")}
        />
        {!property.isAvailable ? <TakenLabel /> : null}
        {showSave ? (
          <SaveButton
            propertyId={property.id}
            title={property.title}
            className="absolute top-2 right-2 size-9 bg-paper/95 shadow-1 hover:bg-paper"
          />
        ) : null}
      </div>
      <div className="grid gap-1 p-3">
        <Price amount={property.priceAmount} />
        <div className="flex min-w-0 items-baseline justify-between gap-3">
          <Heading className="min-w-0 truncate text-step--1 font-semibold text-ink">
            <Link href={href} className={stretched}>
              {property.title}
            </Link>
          </Heading>
          <span className="shrink-0 text-step--3 text-ink-3" suppressHydrationWarning>
            {formatRelative(property.createdAt)}
          </span>
        </div>
        <p className="flex items-center gap-1 truncate text-step--2 text-ink-3">
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          {property.area}, {property.county}
        </p>
      </div>
      <FactChips property={property} className="border-t border-line px-3 py-2.5" />
      {footer ? <div className="relative z-10 border-t border-line p-3">{footer}</div> : null}
    </article>
  );
}

/**
 * List card (reference R1): photo on the left, then title, address, fact chips and the green price
 * at the bottom; the bookmark top right. Used beside the map.
 */
export function ListingRow({
  property,
  priority = false,
  selected = false,
  headingLevel: Heading = "h2",
  onHover,
}: {
  property: PropertyListItem;
  priority?: boolean;
  /** Highlighted while its pin is selected on the map. */
  selected?: boolean;
  headingLevel?: "h2" | "h3";
  onHover?: (id: string | null) => void;
}) {
  const href = `/properties/${property.id}`;
  return (
    <article
      onMouseEnter={onHover ? () => onHover(property.id) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      className={cn(
        "group relative grid grid-cols-[38%_1fr] gap-3 rounded-md border bg-paper p-2.5 transition-colors sm:grid-cols-[11.25rem_1fr] sm:gap-4 sm:p-3",
        selected ? "border-primary" : "border-line hover:border-line-strong",
      )}
    >
      {/* The photo fills its column at the card's height (R1: ~180×168 beside the text). */}
      <div className="relative min-h-32 sm:min-h-42">
        <PhotoFrame
          src={property.primaryImageUrl}
          alt=""
          sizes="(min-width: 640px) 180px, 40vw"
          priority={priority}
          aspect="1:1"
          className={cn("absolute inset-0 aspect-auto rounded-sm", !property.isAvailable && "[&_img]:opacity-70")}
        />
        {!property.isAvailable ? <TakenLabel /> : null}
      </div>
      <div className="grid min-w-0 content-between gap-2 py-0.5">
        <div className="grid gap-1">
          <div className="flex items-start justify-between gap-2">
            <Heading className="line-clamp-2 min-w-0 text-step-0 font-bold text-ink">
              <Link href={href} className={cn(stretched, "group-hover:underline group-hover:underline-offset-2")}>
                {property.title}
              </Link>
            </Heading>
            <SaveButton propertyId={property.id} title={property.title} className="-mt-2 -mr-2" />
          </div>
          <p className="truncate text-step--2 text-ink-3">
            {property.area}, {property.county}
          </p>
        </div>
        <FactChips property={property} />
        <Price amount={property.priceAmount} size="lg" />
      </div>
    </article>
  );
}

export function PropertyPlateSkeleton() {
  return (
    <div aria-hidden className="grid overflow-hidden rounded-md border border-line bg-paper">
      <div className="aspect-[3/2] animate-[skeleton_1.6s_var(--ease-in-out)_infinite] bg-sunk motion-reduce:animate-none" />
      <div className="grid gap-2 p-3">
        <div className="h-5 w-1/3 rounded-xs bg-sunk" />
        <div className="h-4 w-4/5 rounded-xs bg-sunk" />
        <div className="h-4 w-1/2 rounded-xs bg-sunk" />
      </div>
    </div>
  );
}

export function ListingRowSkeleton() {
  return (
    <div aria-hidden className="grid grid-cols-[38%_1fr] gap-3 rounded-md border border-line bg-paper p-2.5 sm:grid-cols-[11.25rem_1fr] sm:gap-4 sm:p-3">
      <div className="aspect-square animate-[skeleton_1.6s_var(--ease-in-out)_infinite] rounded-sm bg-sunk motion-reduce:animate-none sm:aspect-[180/168]" />
      <div className="grid content-between gap-2 py-1">
        <div className="grid gap-2">
          <div className="h-5 w-4/5 rounded-xs bg-sunk" />
          <div className="h-4 w-1/2 rounded-xs bg-sunk" />
        </div>
        <div className="h-6 w-2/3 rounded-xs bg-sunk" />
        <div className="h-6 w-1/3 rounded-xs bg-sunk" />
      </div>
    </div>
  );
}
