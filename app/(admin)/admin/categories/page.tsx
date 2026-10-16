import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const metadata: Metadata = {
  title: "Categories",
  description: "Organise menu items into customer-facing categories.",
};

export default function AdminCategoriesPage() {
  return <CategoriesManager />;
}
