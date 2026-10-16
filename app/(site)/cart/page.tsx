import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your order, adjust quantities and head to checkout.",
};

export default function CartPage() {
  return <CartView />;
}
