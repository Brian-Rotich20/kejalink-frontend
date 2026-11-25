import type { Metadata } from "next";
import { TenantOverview } from "./overview";

export const metadata: Metadata = { title: "Your listings" };

export default function TenantHome() {
  return <TenantOverview />;
}
