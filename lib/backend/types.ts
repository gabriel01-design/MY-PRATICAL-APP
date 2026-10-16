import type {
  Category,
  Meal,
  Order,
  OrderStatus,
  Settings,
} from "@/lib/types";

/** Everything the app needs to boot. */
export interface Snapshot {
  categories: Category[];
  meals: Meal[];
  orders: Order[];
  settings: Settings;
}

/** A signed-in member of staff. */
export interface StaffSession {
  id: string;
  email: string;
  name: string;
  role: "admin" | "kitchen";
}

export type BackendId = "local" | "supabase";

/**
 * The single seam between the UI and its data source.
 *
 * Two implementations ship today:
 *  - local      → everything in localStorage (demo mode, no env vars needed)
 *  - supabase   → Postgres + Supabase Auth (used when env vars are present)
 *
 * Every method rejects with an Error whose message is safe to show to the user.
 * Mutations must be idempotent where practical so the store can retry them from
 * its outbox.
 */
export interface DataBackend {
  readonly id: BackendId;

  /** Load the working set. Anonymous visitors get an empty `orders` array. */
  load(): Promise<Snapshot>;

  /** Public lookup used by the tracking page. */
  getOrderByRef(ref: string): Promise<Order | null>;
  /** Public lookup used by "My orders" (reference + last 10 digits of phone). */
  findOrder(ref: string, phone: string): Promise<Order | null>;

  createOrder(order: Order): Promise<void>;
  createOrders(orders: Order[]): Promise<void>;
  updateOrderStatus(ref: string, status: OrderStatus): Promise<void>;

  createCategory(category: Category): Promise<void>;
  updateCategory(category: Category): Promise<void>;
  deleteCategory(id: string): Promise<void>;

  createMeal(meal: Meal): Promise<void>;
  updateMeal(meal: Meal): Promise<void>;
  deleteMeal(id: string): Promise<void>;

  updateSettings(settings: Settings): Promise<void>;

  /** Restore the original demo catalogue, settings and remove all orders. */
  resetDemoData(): Promise<void>;

  getSession(): Promise<StaffSession | null>;
  /** Unlocks the staff area when the shared access code matches. */
  signIn(code: string): Promise<StaffSession | null>;
  signOut(): Promise<void>;
}

/** Normalise whatever a backend throws into a user-facing message. */
export function describeBackendError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}
