import type { Metadata, Viewport } from "next";
import { Archivo, Atkinson_Hyperlegible_Next } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { Suspense } from "react";
import { SiteHeader, SiteHeaderFallback } from "@/components/layout/site-header";
import { siteUrl } from "@/lib/env/public";
import "./globals.css";

/** Route-board lettering: condensed via the wdth axis. */
const board = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-board",
  display: "swap",
});

/** Everything that is read. */
const text = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
  // next/font has no metrics for the "Next" cut; a hand-tuned fallback (globals.css) prevents layout shift.
  adjustFontFallback: false,
  fallback: ["Atkinson Fallback", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KejaLink · Tafuta keja yako",
    template: "%s · KejaLink",
  },
  description:
    "Find a real place to rent in Nairobi. Request a viewing, get a clear yes or no from the person listing, and pay only after you've seen the house.",
  applicationName: "KejaLink",
  openGraph: {
    type: "website",
    siteName: "KejaLink",
    locale: "en_KE",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#272c38",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-KE" className={`${board.variable} ${text.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>
          <Suspense fallback={<SiteHeaderFallback />}>
            <SiteHeader />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
