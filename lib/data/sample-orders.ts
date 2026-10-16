import type { Meal, Order, OrderStatus, PaymentStatus, Settings } from "@/lib/types";
import { deliveryFeeFor } from "@/lib/types";

interface SampleSpec {
  ref: string;
  daysAgo: number;
  hour: number;
  name: string;
  phone: string;
  fulfillment: "delivery" | "pickup";
  address?: string;
  paymentMethod: "pay-on-delivery" | "demo-payment";
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  picks: { mealId: string; quantity: number }[];
  notes?: string;
}

const SPECS: SampleSpec[] = [
  {
    ref: "MC-8KD2QP",
    daysAgo: 0,
    hour: 11,
    name: "Adaeze Okafor",
    phone: "08031122334",
    fulfillment: "delivery",
    address: "14 Admiralty Way, Lekki Phase 1, Lagos",
    paymentMethod: "demo-payment",
    paymentStatus: "paid-demo",
    status: "preparing",
    picks: [
      { mealId: "jollof-classic", quantity: 2 },
      { mealId: "grilled-chicken", quantity: 1 },
    ],
    notes: "Extra pepper on the side please.",
  },
  {
    ref: "MC-5TR1WB",
    daysAgo: 0,
    hour: 12,
    name: "Tunde Adeyemi",
    phone: "08122233445",
    fulfillment: "pickup",
    paymentMethod: "pay-on-delivery",
    paymentStatus: "unpaid",
    status: "confirmed",
    picks: [{ mealId: "beef-burger", quantity: 2 }],
  },
  {
    ref: "MC-Q9Z3LM",
    daysAgo: 0,
    hour: 13,
    name: "Chiamaka Eze",
    phone: "07034455667",
    fulfillment: "delivery",
    address: "7 Bourdillon Road, Ikoyi, Lagos",
    paymentMethod: "demo-payment",
    paymentStatus: "paid-demo",
    status: "pending",
    picks: [
      { mealId: "pepperoni-pizza", quantity: 1 },
      { mealId: "orange-juice", quantity: 2 },
    ],
  },
  {
    ref: "MC-A1B2C3",
    daysAgo: 1,
    hour: 19,
    name: "Segun Kolapo",
    phone: "08055566778",
    fulfillment: "delivery",
    address: "22 Herbert Macaulay Way, Yaba, Lagos",
    paymentMethod: "demo-payment",
    paymentStatus: "paid-demo",
    status: "completed",
    picks: [
      { mealId: "party-fried-rice", quantity: 3 },
      { mealId: "fried-plantain", quantity: 2 },
    ],
  },
  {
    ref: "MC-D4E5F6",
    daysAgo: 2,
    hour: 20,
    name: "Ngozi Balogun",
    phone: "08166677889",
    fulfillment: "delivery",
    address: "5 Ozumba Mbadiwe Ave, Victoria Island, Lagos",
    paymentMethod: "demo-payment",
    paymentStatus: "paid-demo",
    status: "completed",
    picks: [
      { mealId: "grilled-fish", quantity: 1 },
      { mealId: "white-rice-stew", quantity: 1 },
      { mealId: "zobo-drink", quantity: 2 },
    ],
  },
  {
    ref: "MC-G7H8J9",
    daysAgo: 2,
    hour: 18,
    name: "Emeka Nwosu",
    phone: "07099900112",
    fulfillment: "delivery",
    address: "9 Bode Thomas Street, Surulere, Lagos",
    paymentMethod: "pay-on-delivery",
    paymentStatus: "unpaid",
    status: "completed",
    picks: [{ mealId: "suya-skewers", quantity: 2 }],
  },
  {
    ref: "MC-K1L2M3",
    daysAgo: 3,
    hour: 21,
    name: "Fatima Bello",
    phone: "08012340099",
    fulfillment: "delivery",
    address: "3 Ligali Ayorinde, Victoria Island, Lagos",
    paymentMethod: "demo-payment",
    paymentStatus: "paid-demo",
    status: "cancelled",
    picks: [{ mealId: "supreme-pizza", quantity: 1 }],
  },
  {
    ref: "MC-N4P5Q6",
    daysAgo: 4,
    hour: 12,
    name: "Ibrahim Musa",
    phone: "08123456700",
    fulfillment: "pickup",
    paymentMethod: "pay-on-delivery",
    paymentStatus: "unpaid",
    status: "rejected",
    picks: [{ mealId: "chicken-burger", quantity: 1 }],
  },
  {
    ref: "MC-R7S8T9",
    daysAgo: 5,
    hour: 13,
    name: "Blessing Otu",
    phone: "07087654321",
    fulfillment: "delivery",
    address: "18 Freedom Way, Lekki Phase 1, Lagos",
    paymentMethod: "demo-payment",
    paymentStatus: "paid-demo",
    status: "completed",
    picks: [
      { mealId: "jollof-classic", quantity: 1 },
      { mealId: "puff-puff", quantity: 3 },
      { mealId: "pineapple-juice", quantity: 1 },
    ],
  },
  {
    ref: "MC-U1V2W3",
    daysAgo: 6,
    hour: 14,
    name: "Kwame Asante",
    phone: "08030011223",
    fulfillment: "delivery",
    address: "2 Alexander Road, Ikoyi, Lagos",
    paymentMethod: "demo-payment",
    paymentStatus: "paid-demo",
    status: "completed",
    picks: [
      { mealId: "grilled-chicken", quantity: 2 },
      { mealId: "french-fries", quantity: 2 },
    ],
  },
];

/**
 * Build a set of realistic demo orders relative to "now". Called by the
 * "Load sample orders" action so reports and dashboards have data to show.
 * Totals are computed from the trusted menu, never from stored values.
 */
export function makeSampleOrders(meals: Meal[], settings: Settings): Order[] {
  const byId = new Map(meals.map((meal) => [meal.id, meal]));
  const now = Date.now();

  return SPECS.map((spec) => {
    const createdAt = new Date(now - spec.daysAgo * 24 * 60 * 60 * 1000);
    createdAt.setHours(spec.hour, 15, 0, 0);
    const iso = createdAt.toISOString();

    const items = spec.picks
      .map((pick) => {
        const meal = byId.get(pick.mealId);
        if (!meal) return null;
        return {
          lineId: `${spec.ref}-${pick.mealId}`,
          mealId: meal.id,
          name: meal.name,
          image: meal.image,
          emoji: meal.emoji,
          unitPrice: meal.price,
          quantity: pick.quantity,
          selections: [],
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);

    const subtotal = items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const deliveryFee = deliveryFeeFor(subtotal, settings, spec.fulfillment);

    return {
      ref: spec.ref,
      createdAt: iso,
      customer: { name: spec.name, phone: spec.phone },
      fulfillment: spec.fulfillment,
      address: spec.address,
      notes: spec.notes,
      paymentMethod: spec.paymentMethod,
      paymentStatus: spec.paymentStatus,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      status: spec.status,
      history: [{ status: spec.status, at: iso }],
    };
  });
}
