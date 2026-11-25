import type { Metadata } from "next";
import { NewListing } from "./new-listing";

export const metadata: Metadata = { title: "List a place" };

export default function NewListingPage() {
  return <NewListing />;
}
