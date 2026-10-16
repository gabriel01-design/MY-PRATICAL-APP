"use client";

import { useMemo } from "react";
import { AdminPageHeader, SummaryCard } from "@/components/admin/summary-card";
import { ChartIcon, CheckIcon, CartIcon, TagIcon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import { isRevenueOrder } from "@/lib/orders";
import type { Order } from "@/lib/types";

/** Orders that count toward "popular items" (excludes cancelled / rejected). */
function isCountable(order: Order): boolean {
  return order.status !== "cancelled" && order.status !== "rejected";
}

export function ReportsManager() {
  const { orders, hydrated } = useStore();

  const report = useMemo(() => {
    const completed = orders.filter((o) => o.status === "completed");
    const revenueOrders = orders.filter(isRevenueOrder);
    const revenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);

    const itemCounts = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const order of orders.filter(isCountable)) {
      for (const line of order.items) {
        const entry = itemCounts.get(line.mealId) ?? {
          name: line.name,
          qty: 0,
          revenue: 0,
        };
        entry.qty += line.quantity;
        entry.revenue += line.unitPrice * line.quantity;
        itemCounts.set(line.mealId, entry);
      }
    }
    const popular = [...itemCounts.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);

    const byDay = new Map<string, { label: string; orders: number; revenue: number }>();
    for (const order of revenueOrders) {
      const date = new Date(order.createdAt);
      const key = date.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? {
        label: date.toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        orders: 0,
        revenue: 0,
      };
      entry.orders += 1;
      entry.revenue += order.total;
      byDay.set(key, entry);
    }
    const daily = [...byDay.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 14)
      .map(([, value]) => value);

    return {
      totalOrders: orders.length,
      completed: completed.length,
      revenueOrders: revenueOrders.length,
      revenue,
      popular,
      daily,
    };
  }, [orders]);

  return (
    <div>
      <AdminPageHeader
        title="Sales Reports"
        description="Revenue counts completed and paid (demo) orders only. Cancelled and unpaid orders are excluded."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Orders"
          value={hydrated ? String(report.totalOrders) : "—"}
          icon={<CartIcon className="h-4 w-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Completed orders"
          value={hydrated ? String(report.completed) : "—"}
          icon={<CheckIcon className="h-4 w-4" />}
          tone="leaf"
        />
        <SummaryCard
          label="Paid orders"
          value={hydrated ? String(report.revenueOrders) : "—"}
          icon={<TagIcon className="h-4 w-4" />}
          hint="Counted toward revenue"
        />
        <SummaryCard
          label="Revenue"
          value={hydrated ? formatNaira(report.revenue) : "—"}
          icon={<ChartIcon className="h-4 w-4" />}
          hint="Completed & paid only"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-lg font-bold text-charcoal-900">Popular menu items</h2>
          <p className="mt-1 text-xs text-charcoal-300">
            By quantity across active orders (excludes cancelled/rejected).
          </p>
          {report.popular.length === 0 ? (
            <p className="py-8 text-center text-sm text-charcoal-300">No sales data yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {report.popular.map((item, index) => {
                const max = report.popular[0]?.qty || 1;
                return (
                  <li key={item.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-charcoal-900">
                        <span className="mr-2 text-charcoal-300">#{index + 1}</span>
                        {item.name}
                      </span>
                      <span className="text-charcoal-500">{item.qty} sold</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-200">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${(item.qty / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-bold text-charcoal-900">Daily sales summary</h2>
          <p className="mt-1 text-xs text-charcoal-300">
            Days with completed &amp; paid orders.
          </p>
          {report.daily.length === 0 ? (
            <p className="py-8 text-center text-sm text-charcoal-300">No sales data yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-charcoal-900/5 text-xs uppercase tracking-wide text-charcoal-300">
                    <th className="py-2 font-semibold">Date</th>
                    <th className="py-2 font-semibold">Orders</th>
                    <th className="py-2 text-right font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-900/5">
                  {report.daily.map((day) => (
                    <tr key={day.label}>
                      <td className="py-2.5 text-charcoal-700">{day.label}</td>
                      <td className="py-2.5 text-charcoal-500">{day.orders}</td>
                      <td className="py-2.5 text-right font-semibold text-charcoal-900">
                        {formatNaira(day.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
