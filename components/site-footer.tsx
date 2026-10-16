"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { useCurrentYear } from "@/lib/use-now";
import { BrandMark } from "@/components/ui";
import { LocationIcon, MailIcon, PhoneIcon } from "@/components/icons";

export function SiteFooter() {
  const { settings } = useStore();
  // Read the year via useSyncExternalStore so prerender stays deterministic.
  const year = useCurrentYear();

  return (
    <footer className="mt-20 border-t border-charcoal-900/5 bg-charcoal-900 text-cream-100">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-base font-extrabold text-white">
              {settings.restaurantName}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-cream-100/70">
            {settings.tagline} Hot, fresh Nigerian meals prepared daily and
            delivered across Lagos.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-300">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-cream-100/80">
            {[
              { href: "/menu", label: "Browse Menu" },
              { href: "/cart", label: "Your Cart" },
              { href: "/my-orders", label: "Track an Order" },
              { href: "/about", label: "About Us" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-brand-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-300">
            Contact
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-cream-100/80">
            <li className="flex items-start gap-2.5">
              <LocationIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              {settings.address}
            </li>
            <li className="flex items-center gap-2.5">
              <PhoneIcon className="h-4 w-4 shrink-0 text-brand-400" />
              {settings.phone}
            </li>
            <li className="flex items-center gap-2.5">
              <MailIcon className="h-4 w-4 shrink-0 text-brand-400" />
              {settings.email}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-300">
            Opening Hours
          </h4>
          <p className="mt-4 text-sm leading-relaxed text-cream-100/80">
            {settings.openingHours}
          </p>
          <p className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-xs leading-relaxed text-cream-100/60">
            Demo project — payments are simulated. Staff portals:{" "}
            <Link href="/admin" className="font-semibold text-brand-300 hover:underline">
              Admin
            </Link>{" "}
            ·{" "}
            <Link href="/kitchen" className="font-semibold text-brand-300 hover:underline">
              Kitchen
            </Link>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-cream-100/50 sm:px-6 lg:px-8">
        © {year ?? ""} {settings.restaurantName}. All rights reserved.
      </div>
    </footer>
  );
}
