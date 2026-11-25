"use client";

import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { PhotoFrame } from "@/components/domain/property-plate";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { PropertyImage } from "@/lib/api/schemas/property";
import { cn } from "@/lib/cn";
import { cropTo } from "@/lib/cloudinary";

/**
 * Swipeable photo strip (CSS scroll-snap: native touch, no JS gestures), thumbnails, and a
 * lightbox with arrow-key navigation. Image 1 loads eagerly (LCP); the rest are lazy.
 */
export function Gallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;

  const scrollTo = useCallback(
    (next: number, smooth = true) => {
      const el = strip.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(next, count - 1));
      el.scrollTo({ left: clamped * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
      setIndex(clamped);
    },
    [count],
  );

  // Keep the counter in step with swipes.
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (count === 0) {
    return (
      <PhotoFrame
        src={null}
        alt=""
        sizes="(min-width: 1024px) 60vw, 100vw"
        aspect="3:2"
        className="rounded-md border border-line"
      />
    );
  }

  return (
    <div className="grid gap-3">
      <div className="relative overflow-hidden rounded-md bg-surface-sunk">
        <div
          ref={strip}
          role="region"
          aria-roledescription="carousel"
          aria-label={`Photos of ${title}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") scrollTo(index + 1);
            if (e.key === "ArrowLeft") scrollTo(index - 1);
          }}
          className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Open photo ${i + 1} of ${count} full screen`}
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
              className="relative aspect-[3/2] w-full shrink-0 snap-center snap-always"
            >
              <Image
                src={cropTo(image.url, "3:2")}
                alt={`${title}, photo ${i + 1} of ${count}`}
                fill
                sizes="(min-width: 1280px) 760px, (min-width: 1024px) 60vw, 100vw"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                className="object-cover"
              />
            </button>
          ))}
        </div>
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => scrollTo(index - 1)}
              disabled={index === 0}
              className="absolute top-1/2 left-3 hidden size-11 -translate-y-1/2 place-items-center rounded-sm bg-board/80 text-on-board backdrop-blur transition-opacity hover:bg-board disabled:opacity-0 md:grid"
            >
              <ChevronLeft aria-hidden className="size-6" />
              <span className="sr-only">Previous photo</span>
            </button>
            <button
              type="button"
              onClick={() => scrollTo(index + 1)}
              disabled={index === count - 1}
              className="absolute top-1/2 right-3 hidden size-11 -translate-y-1/2 place-items-center rounded-sm bg-board/80 text-on-board backdrop-blur transition-opacity hover:bg-board disabled:opacity-0 md:grid"
            >
              <ChevronRight aria-hidden className="size-6" />
              <span className="sr-only">Next photo</span>
            </button>
          </>
        ) : null}
        <p className="board-type-wide pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-xs bg-board/85 px-2 py-1 text-step--1 text-on-board">
          <Expand aria-hidden className="size-3.5" />
          <span aria-live="polite">
            {index + 1} / {count}
          </span>
        </p>
      </div>

      {count > 1 ? (
        <ul className="flex [scrollbar-width:thin] gap-2 overflow-x-auto pb-1" aria-label="Choose a photo">
          {images.map((image, i) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => scrollTo(i)}
                aria-current={i === index ? "true" : undefined}
                aria-label={`Show photo ${i + 1}`}
                className={cn(
                  "relative block aspect-[4/3] w-20 overflow-hidden rounded-sm border-2 transition-colors md:w-24",
                  i === index ? "border-ink" : "border-transparent opacity-75 hover:opacity-100",
                )}
              >
                <Image src={cropTo(image.url, "4:3")} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title={`Photo ${index + 1} of ${count}`}
          className="max-h-[100dvh] max-w-[min(100vw,72rem)] bg-board text-on-board sm:max-w-[min(96vw,72rem)] [&_h2]:text-on-board"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, count - 1));
            if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
          }}
        >
          <div className="on-board grid gap-4">
            <div className="relative aspect-[3/2] w-full">
              {images[index] ? (
                <Image
                  key={images[index].id}
                  src={images[index].url}
                  alt={`${title}, photo ${index + 1} of ${count}`}
                  fill
                  sizes="(min-width: 1200px) 1152px, 100vw"
                  className="animate-[fade-in_var(--dur-2)_var(--ease-out)] object-contain"
                />
              ) : null}
            </div>
            {count > 1 ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                  disabled={index === 0}
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm px-3 font-bold hover:bg-board-2 disabled:opacity-40"
                >
                  <ChevronLeft aria-hidden className="size-5" />
                  Previous
                </button>
                <p className="text-step--1 text-on-board-2">Use ← → to move between photos</p>
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.min(i + 1, count - 1))}
                  disabled={index === count - 1}
                  className="inline-flex min-h-11 items-center gap-2 rounded-sm px-3 font-bold hover:bg-board-2 disabled:opacity-40"
                >
                  Next
                  <ChevronRight aria-hidden className="size-5" />
                </button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
