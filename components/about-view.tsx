"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { LocationIcon, MailIcon, PhoneIcon, ClockIcon } from "@/components/icons";

export function AboutView() {
  const { settings } = useStore();

  return (
    <div className="animate-fade-up">
      <section className="bg-gradient-to-b from-brand-50 to-cream-50">
        <div className="mx-auto w-full max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <span className="badge bg-white text-brand-600 shadow-sm">Our story</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-charcoal-900 sm:text-5xl">
            Home-style cooking, delivered with care.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-charcoal-500 sm:text-lg">
            {settings.restaurantName} started in a small Lekki kitchen in 2015 with one
            simple idea: everyone deserves a hot, honest meal without the wait. Today we
            cook the same recipes daily and bring them to doorsteps across Lagos.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              emoji: "👩‍🍳",
              title: "Fresh, never frozen",
              body: "Every dish is prepared to order using ingredients sourced the same day.",
            },
            {
              emoji: "🚚",
              title: "Fast, reliable delivery",
              body: "Our riders cover the island in about 35 minutes on average.",
            },
            {
              emoji: "🌶️",
              title: "Made your way",
              body: "Customise spice levels, portions and extras on every single item.",
            },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <span className="text-3xl" aria-hidden>
                {item.emoji}
              </span>
              <h2 className="mt-3 text-lg font-bold text-charcoal-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-500">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="card mt-8 grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-charcoal-900">Visit or contact us</h2>
            <ul className="mt-4 space-y-3 text-sm text-charcoal-500">
              <li className="flex items-start gap-3">
                <LocationIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {settings.address}
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="h-4 w-4 shrink-0 text-brand-500" />
                {settings.phone}
              </li>
              <li className="flex items-center gap-3">
                <MailIcon className="h-4 w-4 shrink-0 text-brand-500" />
                {settings.email}
              </li>
              <li className="flex items-center gap-3">
                <ClockIcon className="h-4 w-4 shrink-0 text-brand-500" />
                {settings.openingHours}
              </li>
            </ul>
            <Link href="/menu" className="btn btn-primary btn-md mt-6">
              Browse the menu
            </Link>
          </div>

          <div className="rounded-3xl bg-cream-100 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-charcoal-500">
              About this project
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-500">
              This is a portfolio demo of a restaurant ordering system. It runs entirely in
              your browser using LocalStorage — there is no backend, and payments are
              simulated. Staff portals for the{" "}
              <Link href="/admin" className="font-semibold text-brand-600 hover:underline">
                admin
              </Link>{" "}
              and{" "}
              <Link href="/kitchen" className="font-semibold text-brand-600 hover:underline">
                kitchen
              </Link>{" "}
              share the same demo data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
