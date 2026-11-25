import { ImageResponse } from "next/og";
import { getPublicProperty, isUuid } from "@/lib/api/public-data";
import { cropTo, sized } from "@/lib/cloudinary";
import { formatAmount } from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/lib/kenya";
import { OG, OG_SIZE, OgFrame, OgWordmark } from "@/lib/og";

export const alt = "A place to rent on KejaLink";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Per-listing card for WhatsApp/social previews: photo, area board, rent. Falls back to the brand card. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let property = null;
  if (isUuid(id)) {
    try {
      property = (await getPublicProperty(id)).data;
    } catch {
      property = null;
    }
  }

  if (!property) {
    return new ImageResponse(
      <OgFrame>
        <OgWordmark />
        <div style={{ display: "flex", fontSize: 96, fontWeight: 800, textTransform: "uppercase" }}>
          Places to rent
        </div>
      </OgFrame>,
      size,
    );
  }

  const photo = property.uploads[0]?.url;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: OG.board, color: OG.white }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img>
        <img
          src={sized(cropTo(photo, "1:1"), 630)}
          alt=""
          width={630}
          height={630}
          style={{ width: 630, height: 630, objectFit: "cover" }}
        />
      ) : null}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 48,
        }}
      >
        <OgWordmark scale={0.8} />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            {property.area}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: OG.muted }}>
            {PROPERTY_TYPE_LABEL[property.propertyType]} · {property.county}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 30, color: OG.muted }}>KES</span>
            <span style={{ fontSize: 76, fontWeight: 800 }}>{formatAmount(property.priceAmount)}</span>
            <span style={{ fontSize: 28, color: OG.muted }}>/ month</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "10px 18px",
            fontSize: 28,
            fontWeight: 800,
            background: property.isAvailable ? OG.band : OG.board2,
            color: property.isAvailable ? OG.board : OG.white,
          }}
        >
          {property.isAvailable ? "AVAILABLE" : "TAKEN"}
        </div>
      </div>
    </div>,
    size,
  );
}
