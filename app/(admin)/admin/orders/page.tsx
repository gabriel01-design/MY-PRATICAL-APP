import type { Metadata } from "next";
import { OrdersManager } from "@/components/admin/orders-manager";

export const metadata: Metadata = {
  title: "Orders",
  description: "Review incoming orders and move them through the workflow.",
};

export default function AdminOrdersPage() {
  return <OrdersManager />;
}
