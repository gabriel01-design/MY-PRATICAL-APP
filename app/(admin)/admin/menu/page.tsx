import type { Metadata } from "next";
import { MenuManager } from "@/components/admin/menu-manager";

export const metadata: Metadata = {
  title: "Menu",
  description: "Add, edit and retire the meals on your menu.",
};

export default function AdminMenuPage() {
  return <MenuManager />;
}
