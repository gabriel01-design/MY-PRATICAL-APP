"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { AdminNavSuspense, NAV_ITEMS } from "@/components/admin/admin-nav";
import { AdminLogin } from "@/components/admin/admin-login";
import { BrandMark } from "@/components/ui";
import { CloseIcon, MenuIcon, LogoutIcon, UserIcon } from "@/components/icons";
import { useStore } from "@/lib/store";

export function AdminShell({ children }: { children: ReactNode }) {
  const { hydrated, adminAuthed, logout, settings } = useStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 text-sm text-charcoal-300">
        Loading dashboard…
      </div>
    );
  }

  if (!adminAuthed) {
    return <AdminLogin />;
  }

  return (
    <div className="flex min-h-screen bg-cream-50">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-charcoal-900/5 bg-white p-5 lg:flex">
        <div className="flex items-center gap-2.5 px-2">
          <BrandMark size="sm" />
          <span className="leading-tight">
            <span className="block text-sm font-extrabold text-charcoal-900">Admin</span>
            <span className="block text-[11px] font-medium text-charcoal-300">
              {settings.restaurantName}
            </span>
          </span>
        </div>

        <div className="mt-8 flex-1">
          <AdminNavSuspense />
        </div>

        <div className="mt-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-charcoal-500 transition hover:bg-brand-50 hover:text-brand-700"
          >
            <UserIcon className="h-4 w-4" />
            View customer site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogoutIcon className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 border-b border-charcoal-900/5 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BrandMark size="sm" />
              <span className="text-sm font-extrabold text-charcoal-900">Admin</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal-900/10 text-charcoal-700"
              aria-label="Toggle admin navigation"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>

          {mobileNavOpen && (
            <div className="mt-4">
              <AdminNavSuspense />
              <div className="mt-3 space-y-2 border-t border-charcoal-900/5 pt-3">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-charcoal-500"
                >
                  <UserIcon className="h-4 w-4" />
                  View customer site
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-red-600"
                >
                  <LogoutIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export { NAV_ITEMS };
