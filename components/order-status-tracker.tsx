"use client";

import { CheckIcon, CloseIcon } from "@/components/icons";
import { ORDER_STATUS_FLOW, type OrderStatus } from "@/lib/types";

/**
 * Horizontal (responsive vertical on mobile) progress indicator for an order.
 * Exception states (cancelled / rejected) are shown as a distinct banner.
 */
export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  const isException = status === "cancelled" || status === "rejected";
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  if (isException) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white">
          <CloseIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-bold">
            Order {status === "cancelled" ? "cancelled" : "rejected"}
          </p>
          <p className="text-xs text-red-600">
            {status === "cancelled"
              ? "This order was cancelled. Please contact the restaurant for help."
              : "The restaurant could not accept this order. Try placing a new one."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start sm:justify-between">
      {ORDER_STATUS_FLOW.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const label = step.charAt(0).toUpperCase() + step.slice(1);
        return (
          <li key={step} className="relative flex flex-1 gap-3 sm:flex-col sm:items-center sm:gap-2">
            {/* Connector */}
            <span
              aria-hidden
              className={`absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-0.5 sm:left-1/2 sm:top-[15px] sm:h-0.5 sm:w-full sm:translate-x-1/2 ${
                done ? "bg-brand-500" : "bg-charcoal-900/10"
              } ${index === ORDER_STATUS_FLOW.length - 1 ? "hidden sm:block" : ""}`}
            />
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                done
                  ? "bg-brand-500 text-white"
                  : active
                    ? "bg-brand-500 text-white ring-4 ring-brand-100"
                    : "bg-cream-200 text-charcoal-300"
              }`}
            >
              {done ? <CheckIcon className="h-4 w-4" /> : index + 1}
            </span>
            <span
              className={`pb-5 text-sm font-semibold sm:pb-0 sm:text-center ${
                active ? "text-brand-600" : done ? "text-charcoal-700" : "text-charcoal-300"
              }`}
            >
              {label}
              {active && (
                <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700 sm:mt-1 sm:block">
                  Current
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
