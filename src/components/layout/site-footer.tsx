import Link from "next/link";
import { supportEmail } from "@/lib/env/public";
import { Wordmark } from "./wordmark";

const LINKS = [
  { href: "/properties", label: "Browse places" },
  { href: "/register?as=tenant", label: "List a place" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/privacy", label: "Privacy (draft)" },
  { href: "/terms", label: "Terms (draft)" },
] as const;

export function SiteFooter() {
  return (
    <footer className="on-board mt-auto bg-board text-on-board">
      <div aria-hidden className="band-rule" />
      <div className="wrap grid gap-10 py-12 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-4">
          <Wordmark />
          <p className="measure text-on-board-2">
            Real places to rent in Kenya, starting in Nairobi. Pay only after you&apos;ve viewed the house.
          </p>
          {supportEmail ? (
            <p className="text-on-board-2">
              Help:{" "}
              <a
                className="font-bold text-on-board underline underline-offset-4"
                href={`mailto:${supportEmail}`}
              >
                {supportEmail}
              </a>
            </p>
          ) : null}
        </div>
        <nav aria-label="Footer">
          <ul className="grid gap-1 sm:grid-cols-2 sm:gap-x-10">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-on-board-2 underline-offset-4 hover:text-on-board hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
