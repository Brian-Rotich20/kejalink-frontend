import type { ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
/** Share-image colours (orange reference): white ground, dark text, orange marks. */
export const OG = {
  board: "#ffffff",
  board2: "#f4f4f5",
  band: "#fe5c2b",
  white: "#1f1f1f",
  muted: "#5d5d5d",
};

/** The two-plate wordmark, drawn for ImageResponse (flexbox only). */
export function OgWordmark({ scale = 1 }: { scale?: number }) {
  const plate = {
    display: "flex",
    padding: `${10 * scale}px ${18 * scale}px`,
    fontSize: 44 * scale,
    fontWeight: 800,
    letterSpacing: -1,
  } as const;
  return (
    <div style={{ display: "flex" }}>
      <div style={{ ...plate, background: OG.band, color: OG.board }}>KEJA</div>
      <div style={{ ...plate, background: OG.board2, color: OG.band }}>LINK</div>
    </div>
  );
}

export function OgFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: OG.board,
        color: OG.white,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: 64, gap: 28 }}>
        {children}
      </div>
      <div style={{ display: "flex", height: 28, background: OG.band }} />
    </div>
  );
}
