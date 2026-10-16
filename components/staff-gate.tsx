"use client";

import type { ReactNode } from "react";
import { AdminLogin } from "@/components/admin/admin-login";
import { useStore } from "@/lib/store";

/**
 * Gate for staff-only screens (the kitchen display). The admin portal has its
 * own shell with the same check; once Supabase Auth is in play the database
 * policies enforce this too, so this is purely about the UX.
 */
export function StaffGate({ children }: { children: ReactNode }) {
  const { hydrated, adminAuthed } = useStore();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-charcoal-900 text-sm text-cream-100/50">
        Loading staff session…
      </div>
    );
  }

  if (!adminAuthed) return <AdminLogin />;

  return <>{children}</>;
}
