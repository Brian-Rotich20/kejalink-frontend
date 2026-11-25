"use client";

/** Last resort when the root layout itself fails: no app styles or fonts are guaranteed here. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-KE">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          fontFamily: "system-ui, sans-serif",
          background: "#f7f9fb",
          color: "#1c2130",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2rem", textTransform: "uppercase" }}>KejaLink hit a snag</h1>
        <p style={{ margin: 0, maxWidth: "40ch" }}>
          Something broke while loading the page. Try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            justifySelf: "start",
            minHeight: 44,
            padding: "0 1.25rem",
            border: 0,
            borderRadius: 4,
            background: "#fbd02f",
            color: "#1c2130",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
