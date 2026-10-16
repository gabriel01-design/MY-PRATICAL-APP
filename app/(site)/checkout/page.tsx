import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Add your details, choose delivery or pickup and place your order. Payments are simulated in this demo.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
