export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface OptionChoice {
  id: string;
  name: string;
  /** Extra price in naira added to the meal price when selected. */
  price: number;
}

export interface OptionGroup {
  id: string;
  name: string;
  type: "single" | "multi";
  required: boolean;
  choices: OptionChoice[];
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  /** Base price in naira. */
  price: number;
  categoryId: string;
  image: string;
  /** Emoji used as an image fallback (and shown if the photo fails to load). */
  emoji: string;
  available: boolean;
  featured: boolean;
  popular: boolean;
  options: OptionGroup[];
}

export interface CartSelection {
  groupId: string;
  groupName: string;
  choiceNames: string[];
  /** Total extra price for one unit of this line. */
  extra: number;
}

export interface CartLine {
  /** Unique per cart line (same meal with different options gets its own line). */
  lineId: string;
  mealId: string;
  name: string;
  image: string;
  emoji: string;
  /** Base meal price at the time it was added. */
  unitPrice: number;
  quantity: number;
  selections: CartSelection[];
  note?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "rejected"
  | "cancelled";

export interface StatusEvent {
  status: OrderStatus;
  at: string;
}

export type Fulfillment = "delivery" | "pickup";
export type PaymentMethod = "pay-on-delivery" | "demo-payment";
export type PaymentStatus = "unpaid" | "paid-demo";

export interface Order {
  ref: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  fulfillment: Fulfillment;
  address?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  history: StatusEvent[];
}

export interface Settings {
  restaurantName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  deliveryFee: number;
  freeDeliveryOver: number;
}

/** Line total = (base price + extras) * quantity. */
export function lineTotal(line: CartLine): number {
  const extras = line.selections.reduce((sum, s) => sum + s.extra, 0);
  return (line.unitPrice + extras) * line.quantity;
}

/** Delivery fee rules shared by cart, checkout and order placement. */
export function deliveryFeeFor(subtotal: number, settings: Settings, fulfillment: Fulfillment): number {
  if (fulfillment === "pickup") return 0;
  if (subtotal >= settings.freeDeliveryOver) return 0;
  return settings.deliveryFee;
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};
