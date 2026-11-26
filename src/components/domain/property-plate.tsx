import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { PropertyListItem } from "@/lib/api/schemas/property";
import { cn } from "@/lib/cn";
import { cropTo } from "@/lib/cloudinary";
import { formatAmount } from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/lib/kenya";

/** Bedrooms in words people use: a bedsitter or studio is "0 bedrooms" in the data. */
export function bedsLabel(bedrooms: number | null, type: PropertyListItem["propertyType"]): string | null {
  if (bedrooms === null) return null;
  if (bedrooms === 0) return type === "BEDSITTER" || type === "STUDIO" ? null : "No bedroom";
  return `${bedrooms} bed`;
}

/** "Studio, 1 bath" / "Apartment, 2 bed, 2 bath": the room facts as one quiet line. */
export function factsLine(p: Pick<PropertyListItem, "propertyType" | "bedrooms" | "bathrooms">): string {
  const parts: string[] = [PROPERTY_TYPE_LABEL[p.propertyType]];
  const beds = bedsLabel(p.bedrooms, p.propertyType);
  if (beds) parts.push(beds);
  if (p.bathrooms !== null) parts.push(`${p.bathrooms} bath`);
  return parts.join(", ");
}

/**
 * Aspect-locked photo frame (no layout shift). With no photo, the frame carries the area name in
 * the editorial serif instead of an empty grey box with an icon.
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
  aspect?: "4:3" | "3:2";
  /** Shown in the frame when there is no photo (usually the area). */
  emptyLabel?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm bg-sunk",
        aspect === "4:3" ? "aspect-[4/3]" : "aspect-[3/2]",
        className,
      )}
    >
      {src ? (
        <Image
          src={cropTo(src, aspect)}
          alt={alt}
          fill
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col justify-end gap-1 p-4">
          {emptyLabel ? (
            <span className="headline text-step-3 leading-none text-ink-3">{emptyLabel}</span>
          ) : null}
          <span className="text-step--1 text-ink-3">No photos yet</span>
        </div>
      )}
    </div>
  );
}

type PlateProps = {
  property: PropertyListItem;
  /** Image priority for the first row (LCP). */
  priority?: boolean;
  /** Kept for API compatibility; cards no longer animate in. */
  index?: number;
  sizes?: string;
  href?: string;
  /** Extra content under the facts (dashboards add status and actions). */
  footer?: ReactNode;
  headingLevel?: "h2" | "h3";
  /** `lead` is the large first listing in a neighbourhood section. */
  variant?: "default" | "lead";
  /** False inside a neighbourhood section, whose heading already names the area. */
  showArea?: boolean;
};

/**
 * A listing: the photograph first, then where it is and what it costs, then the lister's title
 * and the room facts. No box: hairlines and type do the separating. Only the exception ("Taken")
 * is marked; available is the norm.
 */
export function PropertyPlate({
  property,
  priority = false,
  sizes = "(min-width: 1280px) 384px, (min-width: 640px) 50vw, 100vw",
  href = `/properties/${property.id}`,
  footer,
  headingLevel: Heading = "h3",
  variant = "default",
  showArea = true,
}: PlateProps) {
  const lead = variant === "lead";
  const titleLink = (
    <Link
      href={href}
      className="outline-none group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4 after:absolute after:inset-0 after:rounded-sm focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-focus"
    >
      {property.title}
    </Link>
  );
  return (
    <article className="group relative grid content-start gap-3">
      <div className="relative">
        <PhotoFrame
          src={property.primaryImageUrl}
          alt=""
          sizes={sizes}
          priority={priority}
          emptyLabel={property.area}
          className={cn(!property.isAvailable && "[&_img]:opacity-70")}
        />
        {!property.isAvailable ? (
          <span className="absolute top-3 left-3 rounded-xs bg-paper px-2 py-1 text-step--1 font-semibold text-ink">
            Taken
          </span>
        ) : null}
      </div>
      <div className="grid gap-1">
        <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3">
          {showArea ? (
            <p className={cn("headline min-w-0 truncate", lead ? "text-step-3" : "text-step-2")}>
              {property.area}
              <span className="sr-only">, {property.county}</span>
            </p>
          ) : (
            <Heading className={cn("min-w-0 font-medium text-ink", lead ? "text-step-1" : "text-step-0")}>
              {titleLink}
            </Heading>
          )}
          <p className="shrink-0 whitespace-nowrap">
            <span className={cn("figure text-ink", lead ? "text-step-2" : "text-step-1")}>
              KES {formatAmount(property.priceAmount)}
            </span>
            <span className="text-step--1 text-ink-3"> a month</span>
          </p>
        </div>
        {showArea ? (
          <Heading className={cn("line-clamp-2 text-ink-2", lead ? "text-step-0" : "text-step--1")}>
            {titleLink}
          </Heading>
        ) : null}
        <p className="text-step--1 text-ink-3">{factsLine(property)}</p>
      </div>
      {footer ? <div className="relative z-10">{footer}</div> : null}
    </article>
  );
}

export function PropertyPlateSkeleton() {
  return (
    <div aria-hidden className="grid gap-3">
      <div className="aspect-[4/3] animate-[skeleton_1.6s_var(--ease-in-out)_infinite] rounded-sm bg-sunk motion-reduce:animate-none" />
      <div className="grid gap-2">
        <div className="flex justify-between gap-3">
          <div className="h-6 w-2/5 rounded-xs bg-sunk" />
          <div className="h-6 w-1/4 rounded-xs bg-sunk" />
        </div>
        <div className="h-4 w-4/5 rounded-xs bg-sunk" />
        <div className="h-4 w-1/3 rounded-xs bg-sunk" />
      </div>
    </div>
  );
}
