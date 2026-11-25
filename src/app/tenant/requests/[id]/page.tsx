import type { Metadata } from "next";
import { BookingDetail } from "@/components/domain/booking-detail";

export const metadata: Metadata = { title: "Request" };

export default async function TenantRequestPage({ params }: PageProps<"/tenant/requests/[id]">) {
  const { id } = await params;
  return <BookingDetail id={id} perspective="tenant" />;
}
