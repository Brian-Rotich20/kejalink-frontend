import type { ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG = {
  board: "#100f0d",
  board2: "#22221f",
  band: "#fbd034",
  white: "#fafaf9",
  muted: "#c5c4c0",
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
