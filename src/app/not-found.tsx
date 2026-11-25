import { MapPinOff } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <main id="main" className="wrap grid flex-1 content-center gap-6 py-16">
        <MapPinOff aria-hidden className="size-10 text-ink-3" />
        <h1 className="board-type text-step-5">Wrong stage</h1>
        <p className="measure text-step-1 text-ink-2">
          We couldn&apos;t find that page. If it was a listing, it may have been taken down or removed by the
          person who listed it.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="band" size="lg">
            <Link href="/properties">Browse places</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
