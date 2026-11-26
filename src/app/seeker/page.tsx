import type { Metadata } from "next";
import { SeekerOverview } from "./overview";

export const metadata: Metadata = { title: "Your requests" };

export default function SeekerHome() {
  return <SeekerOverview />;
}
