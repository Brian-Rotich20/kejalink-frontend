import type { Metadata } from "next";
import { EditListing } from "./edit-listing";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({ params }: PageProps<"/tenant/properties/[id]">) {
  const { id } = await params;
  return <EditListing id={id} />;
}
