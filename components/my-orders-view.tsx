"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/ui";
import { ArrowRightIcon, SearchIcon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatDate, formatNaira } from "@/lib/format";
import type { Order } from "@/lib/types";

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function normaliseRef(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function MyOrdersView() {
  const { lookupOrder, demoMode } = useStore();
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Order[] | null>(null);
  const [searching, setSearching] = useState(false);

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const cleanRef = normaliseRef(ref);
    const cleanPhone = onlyDigits(phone);

    if (!cleanRef) {
      setError("Please enter your order reference.");
      setResults(null);
      return;
    }
    if (cleanPhone.length < 10) {
      setError("Please enter the phone number used for the order (at least 10 digits).");
      setResults(null);
      return;
    }

    setSearching(true);
    try {
      const match = await lookupOrder(cleanRef, cleanPhone);
      if (!match) {
        setError(
          "No order matches that reference and phone number. Check the details and try again.",
        );
        setResults([]);
        return;
      }
      setResults([match]);
    } catch {
      setError("We couldn't reach the order service. Please try again in a moment.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <h1 className="section-title">My orders</h1>
        <p className="section-sub">
          Look up a demo order using the reference and the phone number it was placed with.
        </p>
      </header>

      <form onSubmit={lookup} className="card mt-8 p-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Order reference</span>
            <input
              className="input uppercase"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="MC-XXXXXX"
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="label">Phone number</span>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0801 234 5678"
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
        </div>
        {error && <p className="field-error mt-3">{error}</p>}
        <button
          type="submit"
          disabled={searching}
          className="btn btn-primary btn-md mt-4 w-full sm:w-auto"
        >
          <SearchIcon className="h-4 w-4" /> {searching ? "Searching…" : "Find my order"}
        </button>
      </form>

      {results && results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((order) => (
            <article key={order.ref} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-black tracking-wide text-charcoal-900">
                    {order.ref}
                  </p>
                  <p className="text-xs text-charcoal-300">{formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <ul className="mt-4 space-y-1.5 text-sm text-charcoal-500">
                {order.items.map((line) => (
                  <li key={line.lineId}>
                    {line.quantity}× {line.name}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-charcoal-900/5 pt-4">
                <p className="text-base font-extrabold text-charcoal-900">
                  {formatNaira(order.total)}
                </p>
                <div className="flex gap-2">
                  <Link href={`/tracking/${order.ref}`} className="btn btn-primary btn-sm">
                    Track order <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/confirmation/${order.ref}`}
                    className="btn btn-outline btn-sm"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {results && results.length === 0 && !error && (
        <p className="mt-6 text-center text-sm text-charcoal-500">No matching order found.</p>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        <p className="font-bold">About this lookup</p>
        <p className="mt-1">
          {demoMode
            ? "Orders are stored in this browser's LocalStorage only, so this lookup and the orders it finds are not shared across devices."
            : "Orders are looked up on the server using the reference and the phone number used at checkout. The reference alone is enough to track an order, so share it carefully."}{" "}
          A production system would verify orders against real customer accounts.
        </p>
      </div>
    </div>
  );
}
