"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BrandMark } from "@/components/ui";
import { CheckIcon, ClockIcon, FireIcon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/use-now";
import { elapsedLabel } from "@/lib/format";
import { advanceStatus, advanceActionLabel } from "@/lib/orders";
import type { Order, OrderStatus } from "@/lib/types";

interface Column {
  key: string;
  title: string;
  statuses: OrderStatus[];
  accent: string;
}

const COLUMNS: Column[] = [
  {
    key: "new",
    title: "New / Confirmed",
    statuses: ["pending", "confirmed"],
    accent: "border-amber-300",
  },
  {
    key: "preparing",
    title: "Preparing",
    statuses: ["preparing"],
    accent: "border-brand-400",
  },
  {
    key: "ready",
    title: "Ready",
    statuses: ["ready"],
    accent: "border-leaf-500",
  },
];

export function KitchenBoard() {
  const { orders, updateOrderStatus, settings, hydrated } = useStore();
  const now = useNow(1000);

  const active = useMemo(
    () =>
      orders.filter((o) =>
        ["pending", "confirmed", "preparing", "ready"].includes(o.status),
      ),
    [orders],
  );

  function advance(order: Order) {
    const next = advanceStatus(order.status);
    if (!next) return;
    updateOrderStatus(order.ref, next);
  }

  return (
    <div className="min-h-screen bg-charcoal-900 text-cream-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-charcoal-900/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <div>
              <h1 className="text-lg font-black text-white sm:text-xl">Kitchen Display</h1>
              <p className="text-xs text-cream-100/50">{settings.restaurantName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-cream-100 sm:flex">
              <FireIcon className="h-4 w-4 text-brand-400" />
              {active.length} active order{active.length === 1 ? "" : "s"}
            </span>
            <Link
              href="/admin"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-cream-100 transition hover:bg-white/10"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {!hydrated ? (
          <p className="py-20 text-center text-sm text-cream-100/50">Loading orders…</p>
        ) : active.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-5xl" aria-hidden>
              🍳
            </p>
            <p className="mt-4 text-lg font-bold text-white">No active orders</p>
            <p className="mt-1 text-sm text-cream-100/50">
              New orders will appear here as they come in.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {COLUMNS.map((column) => {
              const columnOrders = active
                .filter((o) => column.statuses.includes(o.status))
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                );
              return (
                <section key={column.key} className="flex flex-col">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-cream-100/70">
                      {column.title}
                    </h2>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-cream-100">
                      {columnOrders.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {columnOrders.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-cream-100/40">
                        Nothing here
                      </p>
                    )}
                    {columnOrders.map((order) => (
                      <KitchenCard
                        key={order.ref}
                        order={order}
                        now={now}
                        accent={column.accent}
                        onAdvance={advance}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function KitchenCard({
  order,
  now,
  accent,
  onAdvance,
}: {
  order: Order;
  now: number | null;
  accent: string;
  onAdvance: (order: Order) => void;
}) {
  const label = advanceActionLabel(order.status);

  return (
    <article className={`rounded-3xl border-l-4 ${accent} bg-white p-5 text-charcoal-900 shadow-xl`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-black tracking-wide">{order.ref}</p>
          <p className="text-xs font-medium text-charcoal-500">
            {order.customer.name} ·{" "}
            {order.fulfillment === "pickup" ? "Pickup" : "Delivery"}
          </p>
        </div>
        <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-charcoal-900/5 px-3 py-1 text-xs font-bold text-charcoal-700">
          <ClockIcon className="h-3.5 w-3.5" />
          {now ? elapsedLabel(order.createdAt, now) : "—"}
        </span>
      </div>

      <ul className="mt-4 space-y-2 border-y border-charcoal-900/5 py-3">
        {order.items.map((line) => (
          <li key={line.lineId} className="text-base">
            <span className="font-black text-brand-600">{line.quantity}×</span>{" "}
            <span className="font-semibold">{line.name}</span>
            {line.selections.length > 0 && (
              <ul className="ml-6 mt-0.5 list-disc text-xs text-charcoal-500">
                {line.selections.map((selection) => (
                  <li key={selection.groupId}>
                    {selection.groupName}: {selection.choiceNames.join(", ")}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          ⚠ {order.notes}
        </p>
      )}

      {label && (
        <button
          type="button"
          onClick={() => onAdvance(order)}
          className="btn btn-primary btn-lg mt-4 w-full"
        >
          <CheckIcon className="h-5 w-5" /> {label}
        </button>
      )}
    </article>
  );
}
