"use client";

import Link from "next/link";
import { useState } from "react";
import { FoodImage } from "@/components/food-image";
import { QuantityStepper } from "@/components/quantity-stepper";
import { EmptyState } from "@/components/ui";
import { ArrowRightIcon, TrashIcon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import { deliveryFeeFor, lineTotal } from "@/lib/types";

export function CartView() {
  const { cart, settings, setLineQuantity, removeLine, clearCart, hydrated } = useStore();
  const [confirmClear, setConfirmClear] = useState(false);

  const subtotal = cart.reduce((sum, line) => sum + lineTotal(line), 0);
  const deliveryFee = deliveryFeeFor(subtotal, settings, "delivery");
  const total = subtotal + deliveryFee;
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const qualifiesFreeDelivery = subtotal >= settings.freeDeliveryOver;

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16 text-center text-sm text-charcoal-300 sm:px-6 lg:px-8">
        Loading your cart…
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="section-title text-center">Your cart</h1>
        <div className="mt-8">
          <EmptyState
            emoji="🛒"
            title="Your cart is empty"
            message="Looks like you haven't added anything yet. Browse the menu and find something delicious."
          >
            <Link href="/menu" className="btn btn-primary btn-md">
              Browse the menu
            </Link>
          </EmptyState>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Your cart</h1>
          <p className="section-sub">
            {itemCount} item{itemCount === 1 ? "" : "s"} ready for checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
        >
          <TrashIcon className="h-4 w-4" /> Clear cart
        </button>
      </div>

      {confirmClear && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            Remove all items from your cart?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                clearCart();
                setConfirmClear(false);
              }}
              className="btn btn-danger btn-sm"
            >
              Yes, clear
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {cart.map((line) => (
            <li key={line.lineId} className="card flex gap-4 p-3 sm:p-4">
              <Link
                href={`/food/${line.mealId}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream-200 sm:h-28 sm:w-28"
              >
                <FoodImage
                  src={line.image}
                  alt={line.name}
                  emoji={line.emoji}
                  sizes="112px"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-charcoal-900">
                      <Link href={`/food/${line.mealId}`} className="hover:text-brand-600">
                        {line.name}
                      </Link>
                    </h2>
                    {line.selections.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-xs text-charcoal-500">
                        {line.selections.map((selection) => (
                          <li key={selection.groupId}>
                            <span className="font-semibold">{selection.groupName}:</span>{" "}
                            {selection.choiceNames.join(", ")}
                          </li>
                        ))}
                      </ul>
                    )}
                    {line.note && (
                      <p className="mt-1 text-xs italic text-charcoal-300">“{line.note}”</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.lineId)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-charcoal-300 transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${line.name} from cart`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(qty) => setLineQuantity(line.lineId, qty)}
                    min={1}
                    size="sm"
                    ariaLabel={`${line.name} quantity`}
                  />
                  <div className="text-right">
                    <p className="text-[11px] text-charcoal-300">{formatNaira(lineTotal(line) / line.quantity)} each</p>
                    <p className="text-base font-extrabold text-charcoal-900">
                      {formatNaira(lineTotal(line))}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="text-lg font-bold text-charcoal-900">Order summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal-500">Subtotal</dt>
                <dd className="font-semibold text-charcoal-900">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-500">Delivery (est.)</dt>
                <dd className="font-semibold text-charcoal-900">
                  {deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}
                </dd>
              </div>
              {!qualifiesFreeDelivery && (
                <p className="rounded-2xl bg-brand-50 px-3 py-2 text-xs text-brand-700">
                  Add {formatNaira(settings.freeDeliveryOver - subtotal)} more for free
                  delivery (pickup is always free).
                </p>
              )}
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-charcoal-900/5 pt-4">
              <span className="text-base font-bold text-charcoal-900">Total</span>
              <span className="text-2xl font-black text-brand-600">{formatNaira(total)}</span>
            </div>

            <Link href="/checkout" className="btn btn-primary btn-lg mt-5 w-full">
              Proceed to checkout <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link href="/menu" className="btn btn-ghost btn-sm mt-2 w-full">
              Add more items
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
