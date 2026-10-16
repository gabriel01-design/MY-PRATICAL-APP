"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AdminPageHeader, SummaryCard } from "@/components/admin/summary-card";
import { StatusBadge } from "@/components/ui";
import { CartIcon, CheckIcon, ChartIcon, ClockIcon, PlusIcon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatDate, formatNaira } from "@/lib/format";
import { isRevenueOrder } from "@/lib/orders";

export function DashboardOverview() {
  const { orders, seedSampleOrders, hydrated } = useStore();

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const sales = orders
      .filter(isRevenueOrder)
      .reduce((sum, order) => sum + order.total, 0);
    return { total: orders.length, pending, completed, sales };
  }, [orders]);

  const recent = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6),
    [orders],
  );

  const week = useMemo(() => {
    const days: { label: string; total: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const total = orders
        .filter(isRevenueOrder)
        .filter((order) => {
          const t = new Date(order.createdAt).getTime();
          return t >= day.getTime() && t < next.getTime();
        })
        .reduce((sum, order) => sum + order.total, 0);
      days.push({
        label: day.toLocaleDateString("en-NG", { weekday: "short" }),
        total,
      });
    }
    return days;
  }, [orders]);

  const maxDay = Math.max(1, ...week.map((d) => d.total));

  return (
    <div>
      <AdminPageHeader
        title="Dashboard Overview"
        description="Live summary calculated from your saved demo orders."
        action={
          <button
            type="button"
            onClick={() => seedSampleOrders()}
            className="btn btn-outline btn-sm"
          >
            <PlusIcon className="h-4 w-4" /> Load sample orders
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total orders"
          value={hydrated ? String(stats.total) : "—"}
          icon={<CartIcon className="h-4 w-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Pending orders"
          value={hydrated ? String(stats.pending) : "—"}
          icon={<ClockIcon className="h-4 w-4" />}
          tone="amber"
          hint="Awaiting confirmation"
        />
        <SummaryCard
          label="Completed orders"
          value={hydrated ? String(stats.completed) : "—"}
          icon={<CheckIcon className="h-4 w-4" />}
          tone="leaf"
        />
        <SummaryCard
          label="Total sales"
          value={hydrated ? formatNaira(stats.sales) : "—"}
          icon={<ChartIcon className="h-4 w-4" />}
          hint="Completed & paid orders only"
        />
      </div>

      {hydrated && orders.length === 0 && (
        <div className="card mt-6 flex flex-col items-start gap-3 border-dashed p-6">
          <p className="text-sm font-semibold text-charcoal-900">No orders yet</p>
          <p className="text-sm text-charcoal-500">
            Place an order from the customer site, or load a set of sample orders to explore
            the dashboard, reports and kitchen display.
          </p>
          <button
            type="button"
            onClick={() => seedSampleOrders()}
            className="btn btn-primary btn-sm"
          >
            <PlusIcon className="h-4 w-4" /> Load sample orders
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent orders */}
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-charcoal-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-brand-600 hover:underline">
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-charcoal-300">
              No orders to show yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-charcoal-900/5">
              {recent.map((order) => (
                <li key={order.ref} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-charcoal-900">
                      {order.ref} · {order.customer.name}
                    </p>
                    <p className="text-xs text-charcoal-300">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-charcoal-900">
                      {formatNaira(order.total)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Simple sales chart */}
        <section className="card p-5">
          <h2 className="text-lg font-bold text-charcoal-900">Sales · last 7 days</h2>
          <p className="mt-1 text-xs text-charcoal-300">
            Revenue from completed &amp; paid orders.
          </p>
          <div className="mt-6 flex h-40 items-end justify-between gap-2">
            {week.map((day, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-300 transition-all"
                  style={{ height: `${Math.max(4, (day.total / maxDay) * 100)}%` }}
                  title={`${day.label}: ${formatNaira(day.total)}`}
                />
                <span className="text-[10px] font-medium text-charcoal-300">{day.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
