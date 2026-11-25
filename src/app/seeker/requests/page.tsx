import type { Metadata } from "next";
import { RequestsList } from "@/components/domain/requests-list";
import { PageTitle } from "@/components/layout/area-shell";

export const metadata: Metadata = { title: "My requests" };

export default function SeekerRequestsPage() {
  return (
    <>
      <PageTitle title="My requests">
        <p>
          Pending requests wait for the person listing. Confirmed ones show their email so you can arrange a
          viewing.
        </p>
      </PageTitle>
      <RequestsList perspective="seeker" />
    </>
  );
}
