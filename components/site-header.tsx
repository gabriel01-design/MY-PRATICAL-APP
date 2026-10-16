"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { useCartTotals, useStore } from "@/lib/store";
import { BrandMark } from "@/components/ui";
import { CartIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/icons";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/my-orders", label: "My Orders" },
  { href: "/about", label: "About" },
];

/**
 * Nav links highlight the active route via usePathname. Isolated behind a
 * Suspense boundary so dynamic routes can still be prerendered (Cache
 * Components requirement).
 */
function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="ml-4 hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-brand-100 text-brand-700"
                : "text-charcoal-700 hover:bg-brand-50 hover:text-brand-600"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function DesktopNavFallback() {
  return (
    <nav className="ml-4 hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full px-4 py-2 text-sm font-semibold text-charcoal-700 hover:bg-brand-50 hover:text-brand-600"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  const { settings, searchQuery, setSearchQuery, setCategoryFilter, hydrated } =
    useStore();
  const { itemCount } = useCartTotals();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState(searchQuery);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSearchQuery(query);
    setCategoryFilter("all");
    setMobileOpen(false);
    router.push("/menu");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal-900/5 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <BrandMark />
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-extrabold text-charcoal-900">
              {settings.restaurantName}
            </span>
            <span className="block text-[11px] font-medium text-brand-500">
              Fast &amp; fresh since 2015
            </span>
          </span>
        </Link>

        <Suspense fallback={<DesktopNavFallback />}>
          <DesktopNav />
        </Suspense>

        <form
          onSubmit={submitSearch}
          className="relative ml-auto hidden w-full max-w-xs md:block"
          role="search"
        >
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-300" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input pl-10"
            placeholder="Search for jollof, pizza..."
            aria-label="Search the menu"
          />
        </form>

        <Link
          href="/cart"
          className="relative ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-charcoal-900/10 bg-white text-charcoal-700 transition hover:border-brand-300 hover:text-brand-600 md:ml-2"
          aria-label={`Cart with ${itemCount} items`}
        >
          <CartIcon className="h-5 w-5" />
          {hydrated && itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">
              {itemCount}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-charcoal-900/10 bg-white text-charcoal-700 lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-charcoal-900/5 bg-cream-50 px-4 pb-5 pt-4 sm:px-6 lg:hidden">
          <form onSubmit={submitSearch} className="relative mb-4 md:hidden" role="search">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-300" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input pl-10"
              placeholder="Search for jollof, pizza..."
              aria-label="Search the menu"
            />
          </form>
          <div className="grid gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-charcoal-700 hover:bg-brand-50 hover:text-brand-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
