import type { Metadata } from "next";
import { KitchenBoard } from "@/components/kitchen/kitchen-board";

export const metadata: Metadata = {
  title: "Kitchen display",
  description: "Live order queue for the kitchen team.",
};

export default function KitchenPage() {
  return <KitchenBoard />;
}
