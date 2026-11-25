import type { Metadata } from "next";
import { ProsePage } from "@/components/layout/prose-page";

export const metadata: Metadata = {
  title: "Terms of use (draft)",
  description: "Draft terms of use for KejaLink.",
};

export default function TermsPage() {
  return (
    <ProsePage
      title="Terms of use"
      draft
      intro={
        <p>
          The short version: list honestly, answer requests, and never ask anyone to pay before they&apos;ve
          viewed.
        </p>
      }
    >
      <section>
        <h2>What KejaLink is</h2>
        <p>
          KejaLink connects people looking for a place to rent with the people letting them. KejaLink is not a
          landlord or an agent, does not handle rent or deposits, and is not a party to any tenancy you agree.
        </p>
      </section>
      <section>
        <h2>If you list a place</h2>
        <ul>
          <li>Only list a place you have the right to let, with true details and your own photos.</li>
          <li>Keep availability accurate, and answer requests within a reasonable time.</li>
          <li>Never ask for a viewing fee, or for money before the seeker has viewed the place.</li>
        </ul>
      </section>
      <section>
        <h2>If you&apos;re looking</h2>
        <ul>
          <li>Send requests only for places you&apos;re genuinely interested in.</li>
          <li>View the place before paying anything, and get a receipt for every payment.</li>
        </ul>
      </section>
      <section>
        <h2>Moderation</h2>
        <p>
          KejaLink may take down listings and suspend or ban accounts that break these terms or put others at
          risk. Pending requests on a removed listing are declined automatically.
        </p>
      </section>
      <section>
        <h2>Governing law</h2>
        <p>
          These terms are intended to be governed by the laws of Kenya. Final wording is pending legal review.
        </p>
      </section>
    </ProsePage>
  );
}
