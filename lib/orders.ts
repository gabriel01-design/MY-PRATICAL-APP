import type { Order, OrderStatus } from "@/lib/types";

/**
 * Valid forward/exception transitions for a demo order.
 * Both the admin and kitchen dashboards must respect this so an order can
 * never skip a stage (e.g. pending -> completed) or move backwards.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  rejected: [],
  cancelled: [],
};

export function nextStatuses(current: OrderStatus): OrderStatus[] {
  return TRANSITIONS[current];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** The single "advance" action label used by the kitchen dashboard. */
export function advanceActionLabel(current: OrderStatus): string | null {
  switch (current) {
    case "pending":
      return "Accept order";
    case "confirmed":
      return "Start preparing";
    case "preparing":
      return "Mark ready";
    case "ready":
      return "Complete order";
    default:
      return null;
  }
}

export function advanceStatus(current: OrderStatus): OrderStatus | null {
  switch (current) {
    case "pending":
      return "confirmed";
    case "confirmed":
      return "preparing";
    case "preparing":
      return "ready";
    case "ready":
      return "completed";
    default:
      return null;
  }
}

/**
 * An order counts as realised revenue only once it is completed AND has been
 * paid. Cancelled / rejected / unpaid orders are excluded everywhere.
 */
export function isRevenueOrder(order: Order): boolean {
  return order.status === "completed" && order.paymentStatus === "paid-demo";
}

export function isCompletedOrder(order: Order): boolean {
  return order.status === "completed";
}
