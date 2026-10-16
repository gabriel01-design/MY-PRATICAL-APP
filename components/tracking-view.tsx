"use client";

import Link from "next/link";
import { OrderStatusTracker } from "@/components/order-status-tracker";
import { StatusBadge } from "@/components/ui";
import { EmptyState } from "@/components/ui";
import { ClockIcon } from "@/components/icons";
import { useOrderByRef } from "@/lib/use-order";
import { formatDate, formatNaira } from "@/lib/format";
import { lineTotal } from "@/lib/types";

export function TrackingView({ orderRef }: { orderRef: string }) {
  const { order, loading } = useOrderByRef(orderRef);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center text-sm text-charcoal-300 sm:px-6 lg:px-8">
        Loading order status…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          emoji="🧭"
          title="Order not found"
          message={`We couldn't find an order with the reference "${orderRef}". Double-check it or look up your order using your phone number.`}
        >
          <Link href="/my-orders" className="btn btn-primary btn-md">
            Look up an order
          </Link>
          <Link href="/menu" className="btn btn-outline btn-md">
            Back to menu
          </Link>
        </EmptyState>
      </div>
    );
  }

  const latest = order.history[order.history.length - 1];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Track your order</h1>
          <p className="section-sub">
            Reference <span className="font-bold text-charcoal-700">{order.ref}</span> · placed{" "}
            {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="card mt-8 p-6">
        <OrderStatusTracker status={order.status} />
        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-cream-100 px-4 py-3 text-xs text-charcoal-500">
          <ClockIcon className="h-4 w-4 shrink-0 text-brand-500" />
          Latest update: {formatDate(latest.at)}
          {order.status !== "completed" &&
            order.status !== "cancelled" &&
            order.status !== "rejected" &&
            " · Estimated prep time 25–40 min (estimate only)"}
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="text-lg font-bold text-charcoal-900">Order summary</h2>
        <ul className="mt-4 divide-y divide-charcoal-900/5">
          {order.items.map((line) => (
            <li key={line.lineId} className="flex justify-between gap-3 py-3 text-sm">
              <span className="min-w-0 text-charcoal-700">
                <span className="font-semibold text-charcoal-900">
                  {line.quantity}× {line.name}
                </span>
                {line.selections.length > 0 && (
                  <span className="mt-0.5 block text-xs text-charcoal-300">
                    {line.selections
                      .map((s) => `${s.groupName}: ${s.choiceNames.join(", ")}`)
                      .join(" · ")}
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap font-semibold text-charcoal-900">
                {formatNaira(lineTotal(line))}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-charcoal-900/5 pt-4">
          <span className="text-base font-bold text-charcoal-900">Total</span>
          <span className="text-xl font-black text-brand-600">{formatNaira(order.total)}</span>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-charcoal-500 sm:grid-cols-2">
          <p>
            <span className="font-semibold text-charcoal-700">Fulfilment:</span>{" "}
            {order.fulfillment === "pickup" ? "Pickup at restaurant" : "Delivery"}
          </p>
          <p>
            <span className="font-semibold text-charcoal-700">Payment:</span>{" "}
            {order.paymentStatus === "paid-demo" ? "Paid (demo)" : "Pay on " + (order.fulfillment === "pickup" ? "pickup" : "delivery")}
          </p>
          {order.address && (
            <p className="sm:col-span-2">
              <span className="font-semibold text-charcoal-700">Address:</span> {order.address}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/menu" className="btn btn-primary btn-md flex-1">
          Order something else
        </Link>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn btn-outline btn-md flex-1"
        >
          Refresh status
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-charcoal-300">
        Status updates automatically from shared demo data. Live rider GPS tracking is not
        available in this demo.
      </p>
    </div>
  );
}
