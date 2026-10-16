import { RESTAURANT_SETTINGS, CATEGORIES, MEALS } from "@/lib/data/menu";
import type {
  Category,
  CartLine,
  Meal,
  OptionGroup,
  Order,
  OrderStatus,
  Settings,
  StatusEvent,
} from "@/lib/types";
import type { DataBackend, Snapshot, StaffSession } from "@/lib/backend/types";
import {
  isStaffUnlocked,
  isValidAccessCode,
  setStaffUnlocked,
  staffSession,
} from "@/lib/admin-access";
import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  CategoryRow,
  Json,
  MealRow,
  OrderRow,
  SettingsRow,
} from "@/lib/supabase/database.types";

/**
 * Supabase backend. Rows use snake_case and Postgres enums; the rest of the app
 * speaks the camelCase domain types in lib/types.ts, so all mapping lives here.
 */

/** Domain objects (carts, order history, meal options) are plain JSON at rest. */
function toJson(value: unknown): Json {
  return value as Json;
}

function toCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, emoji: row.emoji };
}

function toMeal(row: MealRow): Meal {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    categoryId: row.category_id ?? "",
    image: row.image,
    emoji: row.emoji,
    available: row.available,
    featured: row.featured,
    popular: row.popular,
    options: (row.options ?? []) as unknown as OptionGroup[],
  };
}

function toOrder(row: OrderRow): Order {
  return {
    ref: row.ref,
    createdAt: row.created_at,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email ?? undefined,
    },
    fulfillment: row.fulfillment,
    address: row.address ?? undefined,
    notes: row.notes ?? undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    items: (row.items ?? []) as unknown as CartLine[],
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    status: row.status,
    history: (row.history ?? []) as unknown as StatusEvent[],
  };
}

function toSettings(row: SettingsRow): Settings {
  return {
    restaurantName: row.restaurant_name,
    tagline: row.tagline,
    phone: row.phone,
    email: row.email,
    address: row.address,
    openingHours: row.opening_hours,
    deliveryFee: row.delivery_fee,
    freeDeliveryOver: row.free_delivery_over,
  };
}

function orderToRow(order: Order) {
  return {
    ref: order.ref,
    created_at: order.createdAt,
    customer_name: order.customer.name,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email ?? null,
    fulfillment: order.fulfillment,
    address: order.address ?? null,
    notes: order.notes ?? null,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    items: toJson(order.items),
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    total: order.total,
    status: order.status,
    history: toJson(order.history),
  };
}

function mealToRow(meal: Meal) {
  return {
    id: meal.id,
    name: meal.name,
    description: meal.description,
    price: meal.price,
    category_id: meal.categoryId || null,
    image: meal.image,
    emoji: meal.emoji,
    available: meal.available,
    featured: meal.featured,
    popular: meal.popular,
    options: toJson(meal.options),
  };
}

function settingsToRow(settings: Settings) {
  return {
    id: 1,
    restaurant_name: settings.restaurantName,
    tagline: settings.tagline,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    opening_hours: settings.openingHours,
    delivery_fee: settings.deliveryFee,
    free_delivery_over: settings.freeDeliveryOver,
    updated_at: new Date().toISOString(),
  };
}

function fail(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

export const supabaseBackend: DataBackend = {
  id: "supabase",

  async load(): Promise<Snapshot> {
    const supabase = getSupabaseClient();

    const [categoriesRes, mealsRes, settingsRes, ordersRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("meals").select("*").order("name", { ascending: true }),
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);

    fail(categoriesRes.error, "Could not load categories");
    fail(mealsRes.error, "Could not load the menu");
    fail(settingsRes.error, "Could not load settings");

    // Anonymous visitors are not allowed to read orders (RLS) — that is fine.
    const orders = ordersRes.error ? [] : (ordersRes.data ?? []).map(toOrder);

    return {
      categories: (categoriesRes.data ?? []).map(toCategory),
      meals: (mealsRes.data ?? []).map(toMeal),
      orders,
      settings: settingsRes.data ? toSettings(settingsRes.data) : RESTAURANT_SETTINGS,
    };
  },

  async getOrderByRef(ref: string): Promise<Order | null> {
    const { data, error } = await getSupabaseClient().rpc("get_order_by_ref", {
      p_ref: ref,
    });
    fail(error, "Could not look up that order");
    return data && data.length ? toOrder(data[0]) : null;
  },

  async findOrder(ref: string, phone: string): Promise<Order | null> {
    const { data, error } = await getSupabaseClient().rpc("find_order", {
      p_ref: ref,
      p_phone: phone,
    });
    fail(error, "Could not look up that order");
    return data && data.length ? toOrder(data[0]) : null;
  },

  async createOrder(order: Order): Promise<void> {
    const { error } = await getSupabaseClient()
      .from("orders")
      .upsert(orderToRow(order), { onConflict: "ref" });
    fail(error, "Could not save the order");
  },

  async createOrders(orders: Order[]): Promise<void> {
    if (!orders.length) return;
    const { error } = await getSupabaseClient()
      .from("orders")
      .upsert(orders.map(orderToRow), { onConflict: "ref" });
    fail(error, "Could not save the sample orders");
  },

  async updateOrderStatus(ref: string, status: OrderStatus): Promise<void> {
    const { error } = await getSupabaseClient().rpc("set_order_status", {
      p_ref: ref,
      p_status: status,
    });
    fail(error, "Could not update the order status");
  },

  async createCategory(category: Category): Promise<void> {
    const { error } = await getSupabaseClient().from("categories").insert(category);
    fail(error, "Could not add the category");
  },

  async updateCategory(category: Category): Promise<void> {
    const { error } = await getSupabaseClient()
      .from("categories")
      .update(category)
      .eq("id", category.id);
    fail(error, "Could not update the category");
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await getSupabaseClient().from("categories").delete().eq("id", id);
    fail(error, "Could not delete the category");
  },

  async createMeal(meal: Meal): Promise<void> {
    const { error } = await getSupabaseClient().from("meals").insert(mealToRow(meal));
    fail(error, "Could not add the meal");
  },

  async updateMeal(meal: Meal): Promise<void> {
    const { error } = await getSupabaseClient()
      .from("meals")
      .update(mealToRow(meal))
      .eq("id", meal.id);
    fail(error, "Could not update the meal");
  },

  async deleteMeal(id: string): Promise<void> {
    const { error } = await getSupabaseClient().from("meals").delete().eq("id", id);
    fail(error, "Could not delete the meal");
  },

  async updateSettings(settings: Settings): Promise<void> {
    const { error } = await getSupabaseClient()
      .from("settings")
      .upsert(settingsToRow(settings), { onConflict: "id" });
    fail(error, "Could not save the settings");
  },

  async resetDemoData(): Promise<void> {
    const supabase = getSupabaseClient();

    // Removes custom meals and categories, then restores the shipped catalogue.
    fail((await supabase.from("orders").delete().neq("ref", "")).error, "Could not clear orders");
    fail((await supabase.from("meals").delete().neq("id", "")).error, "Could not clear meals");

    const seedCategoryIds = new Set(CATEGORIES.map((category) => category.id));
    const { data: existingCategories } = await supabase.from("categories").select("id");
    const staleIds = (existingCategories ?? [])
      .map((row) => row.id)
      .filter((id) => !seedCategoryIds.has(id));
    if (staleIds.length) {
      fail(
        (await supabase.from("categories").delete().in("id", staleIds)).error,
        "Could not clear categories",
      );
    }

    fail(
      (await supabase.from("categories").upsert(CATEGORIES, { onConflict: "id" })).error,
      "Could not restore categories",
    );
    fail(
      (
        await supabase
          .from("meals")
          .upsert(MEALS.map(mealToRow), { onConflict: "id" })
      ).error,
      "Could not restore the menu",
    );
    fail(
      (
        await supabase
          .from("settings")
          .upsert(settingsToRow(RESTAURANT_SETTINGS), { onConflict: "id" })
      ).error,
      "Could not restore settings",
    );
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
