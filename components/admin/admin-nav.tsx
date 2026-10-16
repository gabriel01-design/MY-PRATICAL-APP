"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import {
  ChartIcon,
  GridIcon,
  ListIcon,
  SettingsIcon,
  TagIcon,
  CartIcon,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard Overview", icon: GridIcon },
  { href: "/admin/orders", label: "Orders", icon: CartIcon },
  { href: "/admin/menu", label: "Menu Management", icon: ListIcon },
  { href: "/admin/categories", label: "Food Categories", icon: TagIcon },
  { href: "/admin/reports", label: "Sales Reports", icon: ChartIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

function AdminNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-brand-500 text-white shadow-sm"
                : "text-charcoal-600 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Reads the pathname inside a Suspense boundary so routes can prerender. */
function ActiveNav() {
  const pathname = usePathname() ?? "/admin";
  return <AdminNav pathname={pathname} />;
}

function NavFallback() {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <span
            key={item.href}
            className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-charcoal-500"
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </span>
        );
      })}
    </nav>
  );
}

export function AdminNavSuspense() {
  return (
    <Suspense fallback={<NavFallback />}>
      <ActiveNav />
    </Suspense>
  );
}

export { NAV_ITEMS };
