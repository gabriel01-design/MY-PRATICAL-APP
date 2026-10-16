import type { Metadata } from "next";
import { DashboardOverview } from "@/components/admin/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Orders, sales and activity at a glance.",
};

export default function AdminDashboardPage() {
  return <DashboardOverview />;
}
