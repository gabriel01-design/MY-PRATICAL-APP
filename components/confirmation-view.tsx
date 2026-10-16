"use client";

import Link from "next/link";
import { CheckIcon, ClockIcon, LocationIcon, PhoneIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui";
import { useOrderByRef } from "@/lib/use-order";
import { formatDate, formatNaira } from "@/lib/format";
import { lineTotal } from "@/lib/types";

export function ConfirmationView({ orderRef }: { orderRef: string }) {
  const { order, loading } = useOrderByRef(orderRef);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center text-sm text-charcoal-300 sm:px-6 lg:px-8">
        Loading your order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          emoji="🔎"
          title="We couldn't find that order"
          message={`No order matches the reference "${orderRef}". Check the reference or look up your order again.`}
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

  const paymentLabel =
    order.paymentStatus === "paid-demo"
      ? "Paid (demo)"
      : order.fulfillment === "pickup"
        ? "Pay at pickup"
        : "Pay on delivery";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="card animate-fade-up overflow-hidden">
        <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-leaf-100 to-white px-6 py-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf-500 text-white shadow-lg shadow-leaf-500/30">
            <CheckIcon className="h-8 w-8" />
          </span>
          <h1 className="text-2xl font-black text-charcoal-900 sm:text-3xl">
            Thank you, {order.customer.name.split(" ")[0]}!
          </h1>
          <p className="max-w-md text-sm text-charcoal-500">
            Your order has been received and sent to the kitchen. Keep your reference
            handy to track progress.
          </p>
          <div className="mt-2 rounded-2xl border border-charcoal-900/10 bg-white px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-300">
              Order reference
            </p>
            <p className="text-xl font-black tracking-wider text-brand-600">{order.ref}</p>
          </div>
          <p className="text-xs text-charcoal-300">Placed {formatDate(order.createdAt)}</p>
        </div>

        <div className="border-t border-charcoal-900/5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-bold text-charcoal-900">Fulfilment</h2>
              <p className="mt-2 flex items-start gap-2 text-sm text-charcoal-500">
                <LocationIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {order.fulfillment === "pickup" ? (
                  <span>
                    Pickup at the restaurant
                    <br />
                    <span className="text-xs text-charcoal-300">
                      We&apos;ll message you when it&apos;s ready.
                    </span>
                  </span>
                ) : (
                  <span>
                    Delivery to:
                    <br />
                    <span className="text-charcoal-700">{order.address}</span>
                  </span>
                )}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal-900">Contact</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-charcoal-500">
                <PhoneIcon className="h-4 w-4 shrink-0 text-brand-500" />
                {order.customer.phone}
                {order.customer.email && (
                  <span className="block text-xs text-charcoal-300">{order.customer.email}</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-charcoal-900">Your items</h2>
            <ul className="mt-3 divide-y divide-charcoal-900/5">
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
                    {line.note && (
                      <span className="mt-0.5 block text-xs italic text-charcoal-300">
                        “{line.note}”
                      </span>
                    )}
                  </span>
                  <span className="whitespace-nowrap font-semibold text-charcoal-900">
                    {formatNaira(lineTotal(line))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-4 space-y-2 border-t border-charcoal-900/5 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-charcoal-500">Subtotal</dt>
              <dd className="font-semibold text-charcoal-900">{formatNaira(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-charcoal-500">Delivery fee</dt>
              <dd className="font-semibold text-charcoal-900">
                {order.deliveryFee === 0 ? "Free" : formatNaira(order.deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-charcoal-500">Payment</dt>
              <dd className="font-semibold text-charcoal-900">{paymentLabel}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-charcoal-900/5 pt-3">
              <dt className="text-base font-bold text-charcoal-900">Total</dt>
              <dd className="text-xl font-black text-brand-600">{formatNaira(order.total)}</dd>
            </div>
          </dl>

          {order.notes && (
            <p className="mt-4 rounded-2xl bg-cream-100 px-4 py-3 text-xs text-charcoal-500">
              <span className="font-semibold text-charcoal-700">Notes:</span> {order.notes}
            </p>
          )}

          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-xs text-brand-700">
            <ClockIcon className="h-4 w-4 shrink-0" />
            Estimated preparation time: 25–40 minutes (estimate only — not a guarantee).
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-charcoal-900/5 bg-cream-50 p-6 sm:flex-row">
          <Link href={`/tracking/${order.ref}`} className="btn btn-primary btn-lg flex-1">
            Track this order
          </Link>
          <Link href="/menu" className="btn btn-outline btn-lg flex-1">
            Back to menu
          </Link>
        </div>
      </div>
    </div>
  );
}
