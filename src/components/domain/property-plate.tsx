import { Bath, BedDouble, CameraOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { PropertyListItem } from "@/lib/api/schemas/property";
import { cn } from "@/lib/cn";
import { cropTo } from "@/lib/cloudinary";
import { formatAmount } from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/lib/kenya";
import { AvailabilityPlate } from "./status";

/** Bedrooms in words people use: a bedsitter or studio is "0 bedrooms" in the data. */
export function bedsLabel(bedrooms: number | null, type: PropertyListItem["propertyType"]): string | null {
  if (bedrooms === null) return null;
  if (bedrooms === 0) return type === "BEDSITTER" || type === "STUDIO" ? null : "No bedroom";
  return `${bedrooms} bed`;
}

export function PhotoFrame({
  src,
  alt,
  sizes,
  priority = false,
  className,
  aspect = "4:3",
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  aspect?: "4:3" | "3:2";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-sunk",
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
          className="object-cover transition-transform duration-(--dur-3) ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-ink-3">
          <span className="grid justify-items-center gap-2">
            <CameraOff aria-hidden className="size-6" />
            <span className="board-type-wide text-step--1">No photo yet</span>
          </span>
        </div>
      )}
    </div>
  );
}

type PlateProps = {
  property: PropertyListItem;
  /** Image priority for the first row (LCP). */
  priority?: boolean;
  /** Index in the grid, for the staggered pull-in. */
  index?: number;
  sizes?: string;
  href?: string;
  /** Extra content under the facts (dashboards add status/actions). */
  footer?: ReactNode;
  headingLevel?: "h2" | "h3";
};

/**
 * A listing as a matatu at the stage: photo, the route board (area) in ink, then the fare.
 * The whole plate is one link (the title), so it reads well to screen readers.
 */
export function PropertyPlate({
  property,
  priority = false,
  index = 0,
  sizes = "(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw",
  href = `/properties/${property.id}`,
  footer,
  headingLevel: Heading = "h3",
}: PlateProps) {
  const beds = bedsLabel(property.bedrooms, property.propertyType);
  const style = { animationDelay: `${Math.min(index, 8) * 40}ms` } as CSSProperties;
  return (
    <article
      style={style}
      className={cn(
        "group pull-in relative flex flex-col overflow-hidden rounded-md border border-line bg-surface-2",
        "transition-[translate,box-shadow,border-color] duration-(--dur-2) ease-out",
        "focus-within:border-ink hover:-translate-y-0.5 hover:border-line-strong hover:shadow-1 motion-reduce:hover:translate-y-0",
        !property.isAvailable && "bg-surface",
      )}
    >
      <div className="relative">
        <PhotoFrame src={property.primaryImageUrl} alt="" sizes={sizes} priority={priority} />
        <AvailabilityPlate available={property.isAvailable} className="absolute top-3 left-3" />
      </div>
      <div className="on-board flex items-baseline justify-between gap-3 bg-board px-4 py-2.5 text-on-board">
        <p className="board-type min-w-0 truncate text-step-2">{property.area}</p>
        <p className="shrink-0 text-step--1 text-on-board-2">{property.county}</p>
      </div>
      <div className="grid flex-1 content-start gap-2 px-4 pt-3 pb-4">
        <p className="flex items-baseline gap-1.5">
          <span className="board-type-wide text-step--1 text-ink-2">KES</span>
          <span className="board-type text-step-3">{formatAmount(property.priceAmount)}</span>
          <span className="text-step--1 text-ink-3">/ month</span>
        </p>
        <Heading className="line-clamp-2 leading-snug font-bold text-ink">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
          >
            {property.title}
          </Link>
        </Heading>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-step--1 text-ink-2">
          <li>{PROPERTY_TYPE_LABEL[property.propertyType]}</li>
          {beds ? (
            <li className="inline-flex items-center gap-1">
              <BedDouble aria-hidden className="size-4" />
              {beds}
            </li>
          ) : null}
          {property.bathrooms !== null ? (
            <li className="inline-flex items-center gap-1">
              <Bath aria-hidden className="size-4" />
              {property.bathrooms} bath
            </li>
          ) : null}
        </ul>
        {footer ? <div className="relative z-10 mt-2">{footer}</div> : null}
      </div>
    </article>
  );
}

export function PropertyPlateSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-md border border-line bg-surface-2">
      <div className="aspect-[4/3] animate-[skeleton_1.6s_var(--ease-in-out)_infinite] bg-surface-sunk motion-reduce:animate-none" />
      <div className="h-11 bg-board/85" />
      <div className="grid gap-2.5 px-4 pt-3 pb-4">
        <div className="h-7 w-1/2 rounded-sm bg-surface-sunk" />
        <div className="h-5 w-4/5 rounded-sm bg-surface-sunk" />
        <div className="h-4 w-2/5 rounded-sm bg-surface-sunk" />
      </div>
    </div>
  );
}
