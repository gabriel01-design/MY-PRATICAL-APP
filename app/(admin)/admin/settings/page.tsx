import type { Metadata } from "next";
import { SettingsManager } from "@/components/admin/settings-manager";

export const metadata: Metadata = {
  title: "Settings",
  description: "Restaurant details, delivery fees and demo data controls.",
};

export default function AdminSettingsPage() {
  return <SettingsManager />;
}
