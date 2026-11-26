import type { Metadata } from "next";
import { PropertiesTable } from "./properties-table";

export const metadata: Metadata = { title: "Listings" };

export default function AdminPropertiesPage() {
  return <PropertiesTable />;
}
