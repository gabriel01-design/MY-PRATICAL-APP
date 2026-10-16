import type { ReactNode } from "react";
import type { Metadata } from "next";
import { StaffGate } from "@/components/staff-gate";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function KitchenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex-1 bg-charcoal-900">
      <StaffGate>{children}</StaffGate>
    </div>
  );
}
