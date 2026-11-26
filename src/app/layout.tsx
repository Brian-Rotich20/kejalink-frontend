import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { Suspense } from "react";
import { SiteHeader, SiteHeaderFallback } from "@/components/layout/site-header";
import { siteUrl } from "@/lib/env/public";
import "./globals.css";

/** The one typeface (references R1-R3): headings, interface text, figures. */
const text = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-text",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KejaLink: places to rent in Nairobi",
    template: "%s | KejaLink",
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
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-KE" className={text.variable}>
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
