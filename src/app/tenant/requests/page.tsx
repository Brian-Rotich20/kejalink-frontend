import type { Metadata } from "next";
import { RequestsList } from "@/components/domain/requests-list";
import { PageTitle } from "@/components/layout/area-shell";

export const metadata: Metadata = { title: "Requests" };

export default function TenantRequestsPage() {
  return (
    <>
      <PageTitle title="Requests">
        <p>Confirming one request declines the other pending ones for that place and marks it as taken.</p>
      </PageTitle>
      <RequestsList perspective="tenant" />
    </>
  );
}
