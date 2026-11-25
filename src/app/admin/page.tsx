import type { Metadata } from "next";
import { AdminOverview } from "./overview";

export const metadata: Metadata = { title: "Moderation" };

export default function AdminHome() {
  return <AdminOverview />;
}
