"use client";

import "leaflet/dist/leaflet.css";
import type { CircleMarker, LayerGroup, Map as LeafletMap } from "leaflet";
import { Check, MapPinOff, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PhotoFrame, factsLine } from "@/components/domain/property-plate";
import type { PropertyListItem } from "@/lib/api/schemas/property";
import { cn } from "@/lib/cn";
import { mapTiles } from "@/lib/env/public";
import { formatAmount } from "@/lib/format";

export type Bounds = { north: number; south: number; east: number; west: number };

type Pinned = PropertyListItem & { latitude: number; longitude: number };

const NAIROBI: [number, number] = [-1.2864, 36.8172];
const ACCENT = "#f26a21";
const PRIMARY = "#095650";

export const hasPin = (p: PropertyListItem): p is Pinned =>
  typeof p.latitude === "number" && typeof p.longitude === "number";

/**
 * The results map (references R1 and R2): a light basemap, an orange dot per result with a pin,
 * a floating card for the selected one, and "Search as I move the map".
 */
export default function ListingMap({
  listings,
  selectedId,
  highlightId = null,
  onSelect,
  bounds,
  searchAsMove,
  onSearchAsMove,
  onBounds,
  className,
}: {
  listings: PropertyListItem[];
  selectedId: string | null;
  /** A row hovered in the list: its pin is marked without opening the card. */
  highlightId?: string | null;
  onSelect: (id: string | null) => void;
  /** The bounds filter in the URL, if any (the map opens on it). */
  bounds: Bounds | null;
  searchAsMove: boolean;
  onSearchAsMove: (on: boolean) => void;
  onBounds: (bounds: Bounds) => void;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const markers = useRef(new Map<string, CircleMarker>());
  const [ready, setReady] = useState(false);
  // Latest callbacks for Leaflet's handlers, without re-binding them.
  const live = useRef({ onSelect, onBounds, searchAsMove });
  useEffect(() => {
    live.current = { onSelect, onBounds, searchAsMove };
  });

  const pinned = listings.filter(hasPin);
  const unpinned = listings.length - pinned.length;
  const selected = pinned.find((p) => p.id === selectedId) ?? null;

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    let instance: LeafletMap | null = null;
    void import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      instance = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(NAIROBI, 12);
      L.control.zoom({ position: "topright" }).addTo(instance);
      L.tileLayer(mapTiles.url, { attribution: mapTiles.attribution, maxZoom: 19 }).addTo(instance);
      layer.current = L.layerGroup().addTo(instance);
      instance.on("moveend", () => {
        if (!live.current.searchAsMove || !instance) return;
        const b = instance.getBounds();
        live.current.onBounds({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
      });
      instance.on("click", () => live.current.onSelect(null));
      map.current = instance;
      setReady(true);
    });
    return () => {
      cancelled = true;
      instance?.remove();
      map.current = null;
    };
  }, []);

  // Draw the pins for the current results; open on the URL bounds, else fit the pins.
  const pinKey = pinned.map((p) => `${p.id}:${p.latitude},${p.longitude}`).join("|");
  useEffect(() => {
    if (!ready || !map.current || !layer.current) return;
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !map.current || !layer.current) return;
      layer.current.clearLayers();
      markers.current.clear();
      for (const p of pinned) {
        const marker = L.circleMarker([p.latitude, p.longitude], {
          radius: 7,
          color: "#ffffff",
          weight: 2,
          fillColor: ACCENT,
          fillOpacity: 1,
        })
          .bindTooltip(`KES ${formatAmount(p.priceAmount)}`, { direction: "top", offset: [0, -6] })
          .on("click", (event) => {
            L.DomEvent.stopPropagation(event);
            live.current.onSelect(p.id);
          });
        marker.addTo(layer.current);
        markers.current.set(p.id, marker);
      }
      if (!live.current.searchAsMove) {
        if (bounds) {
          map.current.fitBounds([
            [bounds.south, bounds.west],
            [bounds.north, bounds.east],
          ]);
        } else if (pinned.length > 0) {
          map.current.fitBounds(
            L.latLngBounds(pinned.map((p) => [p.latitude, p.longitude] as [number, number])),
            { padding: [48, 48], maxZoom: 15 },
          );
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // pinKey stands for `pinned`; bounds are read only when the results change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pinKey]);

  // The selected (or hovered) pin turns green and grows.
  const marked = highlightId ?? selectedId;
  useEffect(() => {
    for (const [id, marker] of markers.current) {
      const on = id === marked;
      marker.setStyle({ fillColor: on ? PRIMARY : ACCENT, radius: on ? 10 : 7 });
      if (on) marker.bringToFront();
    }
  }, [marked, pinKey]);

  // The map was hidden then shown (phone toggle): recompute its size.
  useEffect(() => {
    if (!el.current || !map.current) return;
    const observer = new ResizeObserver(() => map.current?.invalidateSize());
    observer.observe(el.current);
    return () => observer.disconnect();
  }, [ready]);

  return (
    <div
      className={cn(
        // R1's light grey basemap: any tile style, desaturated and lifted.
        "relative isolate overflow-hidden bg-[#f2f2f2] [&_.leaflet-tile-pane]:brightness-[1.06] [&_.leaflet-tile-pane]:contrast-[0.88] [&_.leaflet-tile-pane]:grayscale",
        className,
      )}
    >
      <div ref={el} className="absolute inset-0 z-0" role="region" aria-label="Map of results" />

      <label className="absolute top-3 left-1/2 z-[500] flex min-h-10 -translate-x-1/2 cursor-pointer items-center gap-2 rounded-md bg-paper px-3 text-step--2 font-medium whitespace-nowrap text-ink shadow-1">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={searchAsMove}
          onChange={(e) => onSearchAsMove(e.target.checked)}
        />
        <span
          aria-hidden
          className={cn(
            "grid size-4 place-items-center rounded-xs border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
            searchAsMove ? "border-accent bg-accent text-paper" : "border-line-strong",
          )}
        >
          {searchAsMove ? <Check className="size-3" strokeWidth={3} /> : null}
        </span>
        Search as I move the map
      </label>

      {unpinned > 0 && !selected ? (
        <p className="absolute right-3 bottom-8 left-3 z-[500] mx-auto flex max-w-sm items-start gap-2 rounded-md bg-paper p-3 text-step--2 text-ink-2 shadow-1">
          <MapPinOff aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-3" />
          {unpinned === listings.length
            ? "None of these places has a map pin yet. They are all in the list."
            : `${unpinned} of these places ${unpinned === 1 ? "has" : "have"} no map pin yet and ${unpinned === 1 ? "is" : "are"} only in the list.`}
        </p>
      ) : null}

      {selected ? (
        <article className="absolute right-3 bottom-8 left-3 z-[500] mx-auto grid max-w-sm grid-cols-[6.5rem_1fr] gap-3 rounded-lg bg-paper p-2.5 shadow-2">
          <PhotoFrame
            src={selected.primaryImageUrl}
            alt=""
            sizes="104px"
            aspect="1:1"
            className="rounded-md"
          />
          <div className="grid min-w-0 content-between gap-1 pr-6">
            <h3 className="line-clamp-2 text-step--1 font-semibold">
              <Link href={`/properties/${selected.id}`} className="after:absolute after:inset-0 after:rounded-lg">
                {selected.title}
              </Link>
            </h3>
            <p className="truncate text-step--3 text-ink-3">
              {selected.area} · {factsLine(selected)}
            </p>
            <p className="text-primary">
              <span className="figure text-step-0">KES {formatAmount(selected.priceAmount)}</span>
              <span className="text-step--2 font-medium">/month</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="absolute top-1.5 right-1.5 z-10 grid size-8 place-items-center rounded-sm text-ink-3 hover:bg-sunk hover:text-ink"
            aria-label="Close"
          >
            <X aria-hidden className="size-4" />
          </button>
        </article>
      ) : null}
    </div>
  );
}
