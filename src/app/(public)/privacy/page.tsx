import type { Metadata } from "next";
import { ProsePage } from "@/components/layout/prose-page";
import { supportEmail } from "@/lib/env/public";

export const metadata: Metadata = {
  title: "Privacy notice (draft)",
  description: "Draft privacy notice for KejaLink, written with Kenya's Data Protection Act, 2019 in mind.",
};

export default function PrivacyPage() {
  return (
    <ProsePage
      title="Privacy notice"
      draft
      intro={
        <p>
          This draft explains what KejaLink collects, why, and the rights you have under Kenya&apos;s Data
          Protection Act, 2019.
        </p>
      }
    >
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            Account details: your name, email address, a hashed password (never the password itself), and
            whether you joined to look or to list.
          </li>
          <li>
            Sign-in records: when you signed in, and the IP address and browser your session came from, to
            keep accounts safe.
          </li>
          <li>Listings: the details and photos people who list a place choose to publish.</li>
          <li>Viewing requests: the place, your preferred move-in date, your message, and the answer.</li>
        </ul>
      </section>
      <section>
        <h2>Who sees what</h2>
        <ul>
          <li>Anyone can see a published listing and the lister&apos;s name.</li>
          <li>When you request a viewing, the person listing sees your name, email and message.</li>
          <li>The lister&apos;s email is shown to you only after they confirm your request.</li>
          <li>KejaLink administrators can see accounts, listings and requests to keep the service safe.</li>
        </ul>
      </section>
      <section>
        <h2>Where it is stored</h2>
        <p>
          The service runs on cloud providers outside Kenya: the website on Vercel, the API and database on
          Render, and listing photos on Cloudinary. The final policy will set out the safeguards for these
          transfers, as the Act requires.
        </p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>Under the Data Protection Act, 2019 you can ask to:</p>
        <ul>
          <li>see the personal data we hold about you;</li>
          <li>correct it if it is wrong (you can change your name yourself in your account);</li>
          <li>have it deleted, or object to how it is used;</li>
          <li>complain to the Office of the Data Protection Commissioner (ODPC).</li>
        </ul>
        <p>
          To make a request,{" "}
          {supportEmail ? (
            <>
              email{" "}
              <a className="link" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
            </>
          ) : (
            "contact KejaLink support"
          )}{" "}
          from the address on your account.
        </p>
      </section>
      <section>
        <h2>Cookies</h2>
        <p>
          KejaLink uses one essential cookie to keep you signed in. It is not used for advertising or tracking
          across other sites.
        </p>
      </section>
    </ProsePage>
  );
}
