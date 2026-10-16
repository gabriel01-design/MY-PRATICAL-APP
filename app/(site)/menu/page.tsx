import { Suspense } from "react";
import type { Metadata } from "next";
import { MenuView } from "@/components/menu-view";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Browse rice dishes, grills, burgers, pizza, sides and drinks. Search, filter and customise every meal before you order.",
};

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center text-sm text-charcoal-300 sm:px-6 lg:px-8">
          Loading menu…
        </div>
      }
    >
      <MenuView />
    </Suspense>
  );
}
