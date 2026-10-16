import type { Metadata } from "next";
import { AboutView } from "@/components/about-view";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Mama Chidi's Kitchen has cooked fresh Nigerian meals in Lekki since 2015. Learn how we prepare and deliver your food across Lagos.",
};

export default function AboutPage() {
  return <AboutView />;
}
