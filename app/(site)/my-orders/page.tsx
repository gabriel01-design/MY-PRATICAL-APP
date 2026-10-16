import type { Metadata } from "next";
import { MyOrdersView } from "@/components/my-orders-view";

export const metadata: Metadata = {
  title: "My orders",
  description:
    "Find an order by reference or phone number and follow its status from the kitchen to your door.",
};

export default function MyOrdersPage() {
  return <MyOrdersView />;
}
