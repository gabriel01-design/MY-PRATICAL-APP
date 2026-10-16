"use client";

import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/summary-card";
import { StatusBadge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { formatDate, formatNaira } from "@/lib/format";
import { canTransition, nextStatuses } from "@/lib/orders";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

const FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

const ACTION_STYLE: Partial<Record<OrderStatus, string>> = {
  confirmed: "btn-primary",
  preparing: "btn-primary",
  ready: "btn-primary",
  completed: "btn-primary",
  rejected: "btn-danger",
  cancelled: "btn-outline",
};

export function OrdersManager() {
  const { orders, updateOrderStatus, hydrated } = useStore();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  const filtered = useMemo(() => {
    const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [orders, filter]);

  function apply(ref: string, from: OrderStatus, to: OrderStatus) {
    if (!canTransition(from, to)) {
      setFeedback({ type: "err", text: `Cannot move ${ref} from ${from} to ${to}.` });
      return;
    }
    updateOrderStatus(ref, to);
    setFeedback({ type: "ok", text: `${ref} moved to ${ORDER_STATUS_LABELS[to]}.` });
    window.setTimeout(() => setFeedback(null), 2500);
  }

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Review incoming orders and move them through the fulfilment flow."
      />

      {feedback && (
        <div
          role="status"
          className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
            feedback.type === "ok"
              ? "bg-leaf-100 text-leaf-500"
              : "bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const count =
            item.value === "all"
              ? orders.length
              : orders.filter((o) => o.status === item.value).length;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`chip ${filter === item.value ? "chip-active" : ""}`}
            >
              {item.label}
              <span className="ml-1 text-xs opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {!hydrated ? (
        <p className="mt-8 text-sm text-charcoal-300">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-3xl" aria-hidden>
            📋
          </p>
          <p className="mt-3 text-sm font-semibold text-charcoal-900">No orders here</p>
          <p className="mt-1 text-sm text-charcoal-500">
            {filter === "all"
              ? "Orders placed on the customer site will appear here."
              : "There are no orders with this status."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((order) => {
            const allowed = nextStatuses(order.status);
            return (
              <article key={order.ref} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black tracking-wide text-charcoal-900">
                      {order.ref}
                    </p>
                    <p className="text-xs text-charcoal-300">{formatDate(order.createdAt)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Detail label="Customer">
                    <p className="font-semibold text-charcoal-900">{order.customer.name}</p>
                    <p className="text-xs text-charcoal-500">{order.customer.phone}</p>
                  </Detail>
                  <Detail label="Fulfilment">
                    <p className="font-semibold capitalize text-charcoal-900">
                      {order.fulfillment}
                    </p>
                    {order.address && (
                      <p className="text-xs text-charcoal-500">{order.address}</p>
                    )}
                  </Detail>
                  <Detail label="Payment">
                    <p className="font-semibold text-charcoal-900">
                      {order.paymentStatus === "paid-demo" ? "Paid (demo)" : "Unpaid"}
                    </p>
                    <p className="text-xs capitalize text-charcoal-500">
                      {order.paymentMethod.replace("-", " ")}
                    </p>
                  </Detail>
                  <Detail label="Total">
                    <p className="text-lg font-black text-brand-600">
                      {formatNaira(order.total)}
                    </p>
                  </Detail>
                </div>

                <div className="mt-4 rounded-2xl bg-cream-100 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-300">
                    Items
                  </p>
                  <ul className="mt-1.5 space-y-1 text-sm text-charcoal-700">
                    {order.items.map((line) => (
                      <li key={line.lineId}>
                        {line.quantity}× {line.name}
                        {line.selections.length > 0 && (
                          <span className="text-xs text-charcoal-300">
                            {" "}
                            ({line.selections
                              .map((s) => s.choiceNames.join(", "))
                              .join("; ")})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {order.notes && (
                    <p className="mt-2 text-xs italic text-charcoal-500">
                      Note: {order.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {allowed.length === 0 ? (
                    <span className="text-xs font-medium text-charcoal-300">
                      No further actions for this order.
                    </span>
                  ) : (
                    allowed.map((next) => (
                      <button
                        key={next}
                        type="button"
                        onClick={() => apply(order.ref, order.status, next)}
                        className={`btn ${ACTION_STYLE[next] ?? "btn-outline"} btn-sm`}
                      >
                        {actionLabel(next)}
                      </button>
                    ))
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function actionLabel(status: OrderStatus): string {
  switch (status) {
    case "confirmed":
      return "Accept order";
    case "preparing":
      return "Start preparing";
    case "ready":
      return "Mark ready";
    case "completed":
      return "Mark completed";
    case "rejected":
      return "Reject";
    case "cancelled":
      return "Cancel order";
    default:
      return status;
  }
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-300">
        {label}
      </p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
