import { ImageResponse } from "next/og";
import { OG, OG_SIZE, OgFrame, OgWordmark } from "@/lib/og";

export const alt = "KejaLink: real places to rent in Nairobi";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgFrame>
      <OgWordmark />
      <div
        style={{ display: "flex", fontSize: 104, fontWeight: 800, lineHeight: 1, textTransform: "uppercase" }}
      >
        Tafuta keja yako.
      </div>
      <div style={{ display: "flex", fontSize: 38, color: OG.muted, maxWidth: 980 }}>
        Real places to rent in Nairobi. Request a viewing, get a clear answer, pay only after you&apos;ve seen
        the house.
      </div>
    </OgFrame>,
    size,
  );
}
