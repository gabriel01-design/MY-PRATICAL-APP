import { CATEGORIES, MEALS, RESTAURANT_SETTINGS } from "@/lib/data/menu";
import { makeSampleOrders } from "@/lib/data/sample-orders";
import {
  isStaffUnlocked,
  isValidAccessCode,
  setStaffUnlocked,
  staffSession,
} from "@/lib/admin-access";
import type {
  Category,
  Meal,
  Order,
  OrderStatus,
  Settings,
} from "@/lib/types";
import type { DataBackend, Snapshot, StaffSession } from "@/lib/backend/types";

/**
 * Default backend: keeps the demo working with zero configuration by storing
 * everything in localStorage. Behaviour matches the original single-key store.
 */
const STORAGE_KEY = "mama-chidis-demo-v1";

interface Persisted {
  categories: Category[];
  meals: Meal[];
  orders: Order[];
  settings: Settings;
}

function readPersisted(): Persisted {
  if (typeof window === "undefined") {
    return { categories: CATEGORIES, meals: MEALS, orders: [], settings: RESTAURANT_SETTINGS };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<Persisted>) : {};
    return {
      categories: saved.categories?.length ? saved.categories : CATEGORIES,
      meals: saved.meals?.length ? saved.meals : MEALS,
      orders: Array.isArray(saved.orders) ? saved.orders : [],
      settings: { ...RESTAURANT_SETTINGS, ...saved.settings },
    };
  } catch {
    return { categories: CATEGORIES, meals: MEALS, orders: [], settings: RESTAURANT_SETTINGS };
  }
}

function writePersisted(data: Persisted): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked — the demo still works in memory.
  }
}

function patchOrders(updater: (orders: Order[]) => Order[]): void {
  const data = readPersisted();
  writePersisted({ ...data, orders: updater(data.orders) });
}

export function readLocalStorageDemo(): Persisted {
  return readPersisted();
}

export const localBackend: DataBackend = {
  id: "local",

  async load(): Promise<Snapshot> {
    const data = readPersisted();
    // Seeding happens here so an empty project still shows sample orders.
    const orders = data.orders.length ? data.orders : makeSampleOrders(data.meals, data.settings);
    if (!data.orders.length && orders.length) writePersisted({ ...data, orders });
    return { ...data, orders };
  },

  async getOrderByRef(ref: string): Promise<Order | null> {
    const target = ref.trim().toUpperCase();
    return readPersisted().orders.find((order) => order.ref.toUpperCase() === target) ?? null;
  },

  async findOrder(ref: string, phone: string): Promise<Order | null> {
    const target = ref.trim().toUpperCase();
    const digits = phone.replace(/\D/g, "");
    return (
      readPersisted().orders.find(
        (order) =>
          order.ref.toUpperCase() === target &&
          order.customer.phone.replace(/\D/g, "").endsWith(digits.slice(-10)),
      ) ?? null
    );
  },

  async createOrder(order: Order): Promise<void> {
    patchOrders((orders) => [order, ...orders.filter((item) => item.ref !== order.ref)]);
  },

  async createOrders(orders: Order[]): Promise<void> {
    patchOrders((existing) => {
      const refs = new Set(orders.map((order) => order.ref));
      return [...orders, ...existing.filter((order) => !refs.has(order.ref))];
    });
  },

  async updateOrderStatus(ref: string, status: OrderStatus): Promise<void> {
    patchOrders((orders) =>
      orders.map((order) =>
        order.ref === ref
          ? {
              ...order,
              status,
              history: [...order.history, { status, at: new Date().toISOString() }],
            }
          : order,
      ),
    );
  },

  async createCategory(category: Category): Promise<void> {
    const data = readPersisted();
    writePersisted({ ...data, categories: [...data.categories, category] });
  },

  async updateCategory(category: Category): Promise<void> {
    const data = readPersisted();
    writePersisted({
      ...data,
      categories: data.categories.map((item) => (item.id === category.id ? category : item)),
    });
  },

  async deleteCategory(id: string): Promise<void> {
    const data = readPersisted();
    writePersisted({ ...data, categories: data.categories.filter((item) => item.id !== id) });
  },

  async createMeal(meal: Meal): Promise<void> {
    const data = readPersisted();
    writePersisted({ ...data, meals: [...data.meals, meal] });
  },

  async updateMeal(meal: Meal): Promise<void> {
    const data = readPersisted();
    writePersisted({
      ...data,
      meals: data.meals.map((item) => (item.id === meal.id ? meal : item)),
    });
  },

  async deleteMeal(id: string): Promise<void> {
    const data = readPersisted();
    writePersisted({ ...data, meals: data.meals.filter((item) => item.id !== id) });
  },

  async updateSettings(settings: Settings): Promise<void> {
    const data = readPersisted();
    writePersisted({ ...data, settings });
  },

  async resetDemoData(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setStaffUnlocked(false);
    } catch {
      // ignore
    }
  },

  async getSession(): Promise<StaffSession | null> {
    return isStaffUnlocked() ? staffSession() : null;
  },

  async signIn(code: string): Promise<StaffSession | null> {
    if (!isValidAccessCode(code)) return null;
    setStaffUnlocked(true);
    return staffSession();
  },

  async signOut(): Promise<void> {
    setStaffUnlocked(false);
  },
};
