import type { Metadata } from "next";
import { BookingsTable } from "./bookings-table";

export const metadata: Metadata = { title: "Requests" };

export default function AdminBookingsPage() {
  return <BookingsTable />;
}
