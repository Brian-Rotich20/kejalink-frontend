import Link from "next/link";
import { supportEmail } from "@/lib/env/public";
import { Wordmark } from "./wordmark";

const GROUPS = [
  {
    title: "Renting",
    links: [
      { href: "/properties", label: "Browse places" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/register?as=seeker", label: "Create an account" },
    ],
  },
  {
    title: "Letting",
    links: [
      { href: "/register?as=tenant", label: "List a place" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy (draft)" },
      { href: "/terms", label: "Terms (draft)" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="wrap grid gap-10 py-12 md:grid-cols-12 md:gap-6 md:py-16">
        <div className="grid content-start gap-3 md:col-span-5">
          <Wordmark />
          <p className="measure text-ink-2">
            Places to rent in Kenya, starting in Nairobi. Pay only after you have viewed the house.
          </p>
          {supportEmail ? (
            <p className="text-ink-2">
              Questions?{" "}
              <a className="link" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
            </p>
          ) : null}
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-6 md:col-start-7">
          {GROUPS.map((group) => (
            <div key={group.title} className="grid content-start gap-2">
              <h2 className="text-step--1 font-semibold text-ink">{group.title}</h2>
              <ul className="grid">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-ink-2 underline-offset-4 hover:text-ink hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
