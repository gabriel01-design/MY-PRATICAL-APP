import type { Metadata } from "next";
import { ReportsManager } from "@/components/admin/reports-manager";

export const metadata: Metadata = {
  title: "Reports",
  description: "Sales, top sellers and order performance over time.",
};

export default function AdminReportsPage() {
  return <ReportsManager />;
}
