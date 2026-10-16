"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CATEGORIES, MEALS, RESTAURANT_SETTINGS } from "@/lib/data/menu";
import { makeSampleOrders } from "@/lib/data/sample-orders";
import {
  backend,
} from "@/lib/backend";
import type { BackendId, Snapshot, StaffSession } from "@/lib/backend/types";
import { describeBackendError } from "@/lib/backend/types";
import {
  deliveryFeeFor,
  lineTotal,
  type CartLine,
  type CartSelection,
  type Category,
  type Fulfillment,
  type Meal,
  type Order,
  type OrderStatus,
  type PaymentMethod,
  type Settings,
} from "@/lib/types";

/**
 * The store keeps a local cache of backend data plus purely client-side state
 * (cart, search, filters). Reads are synchronous off that cache so components
 * stay simple; writes go through `lib/backend` and are applied optimistically,
 * with rollback (or an outbox retry when offline) if the backend rejects them.
 */

const CART_KEY = "mama-chidis-cart-v1";
const OUTBOX_KEY = "mama-chidis-outbox-v1";
const LEGACY_KEY = "mama-chidis-demo-v1";

type OutboxEntry =
  | { id: string; kind: "order.create"; order: Order }
  | { id: string; kind: "order.status"; ref: string; status: OrderStatus };

export interface StoreState {
  categories: Category[];
  meals: Meal[];
  orders: Order[];
  settings: Settings;
  cart: CartLine[];
  hydrated: boolean;
  staff: StaffSession | null;
  adminAuthed: boolean;
  backendId: BackendId;
  demoMode: boolean;
  syncError: string | null;
  searchQuery: string;
  categoryFilter: string;
}

type Action =
  | { type: "hydrate"; payload: Partial<Snapshot> & { staff: StaffSession | null; cart: CartLine[] } }
  | { type: "patch"; patch: Partial<StoreState> }
  | { type: "cart:add"; line: CartLine }
  | { type: "cart:setQty"; lineId: string; quantity: number }
  | { type: "cart:remove"; lineId: string }
  | { type: "cart:clear" }
  | { type: "ui:search"; query: string }
  | { type: "ui:category"; id: string };

function initialState(): StoreState {
  return {
    categories: CATEGORIES,
    meals: MEALS,
    orders: [],
    settings: RESTAURANT_SETTINGS,
    cart: [],
    hydrated: false,
    staff: null,
    adminAuthed: false,
    backendId: backend.id,
    demoMode: backend.id === "local",
    syncError: null,
    searchQuery: "",
    categoryFilter: "all",
  };
}

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "hydrate":
      return {
        ...state,
        ...action.payload,
        adminAuthed: Boolean(action.payload.staff),
        hydrated: true,
      };
    case "patch":
      return { ...state, ...action.patch };
    case "cart:add": {
      const incoming = action.line;
      const selectionKey = JSON.stringify(
        incoming.selections.map((s) => [s.groupId, [...s.choiceNames].sort()]),
      );
      const existing = state.cart.find(
        (line) =>
          line.mealId === incoming.mealId &&
          JSON.stringify(
            line.selections.map((s) => [s.groupId, [...s.choiceNames].sort()]),
          ) === selectionKey &&
          (line.note ?? "") === (incoming.note ?? ""),
      );
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((line) =>
            line.lineId === existing.lineId
              ? { ...line, quantity: line.quantity + incoming.quantity }
              : line,
          ),
        };
      }
      return { ...state, cart: [...state.cart, incoming] };
    }
    case "cart:setQty": {
      if (action.quantity < 1) {
        return {
          ...state,
          cart: state.cart.filter((line) => line.lineId !== action.lineId),
        };
      }
      return {
        ...state,
        cart: state.cart.map((line) =>
          line.lineId === action.lineId
            ? { ...line, quantity: action.quantity }
            : line,
        ),
      };
    }
    case "cart:remove":
      return {
        ...state,
        cart: state.cart.filter((line) => line.lineId !== action.lineId),
      };
    case "cart:clear":
      return { ...state, cart: [] };
    case "ui:search":
      return { ...state, searchQuery: action.query };
    case "ui:category":
      return { ...state, categoryFilter: action.id };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ helpers */

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateOrderRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MC-${code}`;
}

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

function normaliseRef(value: string): string {
  return value.trim().toUpperCase();
}

function phoneMatches(candidate: string, query: string): boolean {
  const digits = query.replace(/\D/g, "").slice(-10);
  return digits.length > 0 && candidate.replace(/\D/g, "").endsWith(digits);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — the app keeps working from memory.
  }
}

/** Cart survives a refresh, and migrates the cart out of the legacy demo key. */
function readCart(): CartLine[] {
  const stored = readJson<unknown>(CART_KEY, null);
  if (Array.isArray(stored)) return stored as CartLine[];
  const legacy = readJson<{ cart?: unknown }>(LEGACY_KEY, {});
  return Array.isArray(legacy.cart) ? (legacy.cart as CartLine[]) : [];
}

function readOutbox(): OutboxEntry[] {
  const stored = readJson<unknown>(OUTBOX_KEY, []);
  return Array.isArray(stored) ? (stored as OutboxEntry[]) : [];
}

/**
 * Server data wins, but orders that only exist locally (just placed, or still
 * waiting in the outbox) are kept so a background refresh can't drop them.
 */
function mergeOrders(server: Order[], local: Order[]): Order[] {
  const serverRefs = new Set(server.map((order) => order.ref));
  return [...server, ...local.filter((order) => !serverRefs.has(order.ref))];
}

/* ------------------------------------------------------------------- types */

export interface PlaceOrderInput {
  customer: { name: string; phone: string; email?: string };
  fulfillment: Fulfillment;
  address?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

interface StoreActions {
  addToCart: (
    meal: Meal,
    selections: CartSelection[],
    quantity: number,
    note?: string,
  ) => void;
  setLineQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;

  /** Creates the order locally and pushes it to the backend. */
  placeOrder: (input: PlaceOrderInput) => Order | null;
  updateOrderStatus: (ref: string, status: OrderStatus) => void;
  seedSampleOrders: () => number;

  /** Reads a single order via the backend (tracking / confirmation pages). */
  loadOrderByRef: (ref: string) => Promise<Order | null>;
  /** Reference + phone lookup used by "My orders". */
  lookupOrder: (ref: string, phone: string) => Promise<Order | null>;

  addMeal: (meal: Omit<Meal, "id">) => Meal;
  updateMeal: (meal: Meal) => void;
  removeMeal: (mealId: string) => void;

  addCategory: (name: string, emoji: string) => Category;
  updateCategory: (category: Category) => void;
  removeCategory: (id: string) => Promise<{ ok: boolean; error?: string }>;

  updateSettings: (settings: Settings) => void;
  resetDemoData: () => Promise<void>;

  login: (code: string) => Promise<boolean>;
  logout: () => void;
  /** Re-renders orders from the backend (used on window focus without Realtime). */
  refreshOrders: () => Promise<void>;

  setSearchQuery: (query: string) => void;
  setCategoryFilter: (id: string) => void;

  clearSyncError: () => void;
  /** Number of writes queued because the device was offline. */
  pendingWrites: number;
  retryPending: () => Promise<void>;
}

const StoreContext = createContext<(StoreState & StoreActions) | null>(null);

/* ---------------------------------------------------------------- provider */

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [pendingWrites, setPendingWrites] = useState(() => readOutbox().length);
  const stateRef = useRef(state);
  const outboxRef = useRef<OutboxEntry[]>([]);
  const cartSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setSyncError = useCallback((message: string) => {
    dispatch({ type: "patch", patch: { syncError: message } });
  }, []);

  const clearSyncError = useCallback(() => {
    dispatch({ type: "patch", patch: { syncError: null } });
  }, []);

  /* ---- outbox: queue writes made while offline, retry when possible ---- */

  const persistOutbox = useCallback((entries: OutboxEntry[]) => {
    outboxRef.current = entries;
    writeJson(OUTBOX_KEY, entries);
    setPendingWrites(entries.length);
  }, []);

  const enqueue = useCallback(
    (entry: OutboxEntry) => {
      if (outboxRef.current.some((item) => item.id === entry.id)) return;
      persistOutbox([...outboxRef.current, entry]);
    },
    [persistOutbox],
  );

  const retryPending = useCallback(async () => {
    const queue = outboxRef.current;
    if (!queue.length) return;
    const remaining: OutboxEntry[] = [];
    for (const entry of queue) {
      try {
        if (entry.kind === "order.create") await backend.createOrder(entry.order);
        else await backend.updateOrderStatus(entry.ref, entry.status);
      } catch {
        remaining.push(entry);
      }
    }
    persistOutbox(remaining);
    if (remaining.length === 0) {
      try {
        const snapshot = await backend.load();
        dispatch({
          type: "patch",
          patch: {
            orders: mergeOrders(snapshot.orders, stateRef.current.orders),
            syncError: null,
          },
        });
      } catch {
        // The next load will pick the orders up.
      }
    }
  }, [persistOutbox]);

  /* ---- initial load + session restore ---- */

  useEffect(() => {
    let cancelled = false;
    outboxRef.current = readOutbox();
    const cart = readCart();

    (async () => {
      try {
        const [snapshot, session] = await Promise.all([
          backend.load(),
          backend.getSession(),
        ]);
        if (cancelled) return;
        dispatch({
          type: "hydrate",
          payload: { ...snapshot, cart, staff: session },
        });
        if (outboxRef.current.length) void retryPending();
      } catch (error) {
        if (cancelled) return;
        // Fall back to the seeded catalogue so the site is still browsable.
        dispatch({
          type: "hydrate",
          payload: {
            categories: CATEGORIES,
            meals: MEALS,
            orders: [],
            settings: RESTAURANT_SETTINGS,
            cart,
            staff: null,
          },
        });
        setSyncError(
          describeBackendError(
            error,
            "Could not reach the backend. Browsing the sample menu instead.",
          ),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [retryPending, setSyncError]);

  /* ---- cart persistence ---- */

  useEffect(() => {
    if (!state.hydrated) return;
    if (cartSaveTimer.current) clearTimeout(cartSaveTimer.current);
    cartSaveTimer.current = setTimeout(() => writeJson(CART_KEY, state.cart), 150);
    return () => {
      if (cartSaveTimer.current) clearTimeout(cartSaveTimer.current);
    };
  }, [state.hydrated, state.cart]);

  /* ---- keep the cache fresh without Realtime ---- */

  const refreshOrders = useCallback(async () => {
    try {
      const snapshot = await backend.load();
      dispatch({
        type: "patch",
        patch: { orders: mergeOrders(snapshot.orders, stateRef.current.orders) },
      });
    } catch {
      // Leave the cached orders in place.
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    function onFocus() {
      void retryPending();
      void refreshOrders();
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [state.hydrated, retryPending, refreshOrders]);

  /* ---- shared optimistic-update helper ---- */

  const optimistic = useCallback(
    async (
      apply: Partial<StoreState>,
      rollback: Partial<StoreState>,
      work: () => Promise<void>,
      fallbackMessage: string,
    ) => {
      dispatch({ type: "patch", patch: apply });
      try {
        await work();
      } catch (error) {
        dispatch({ type: "patch", patch: rollback });
        setSyncError(describeBackendError(error, fallbackMessage));
      }
    },
    [setSyncError],
  );

  /* ---- cart ---- */

  const addToCart = useCallback(
    (meal: Meal, selections: CartSelection[], quantity: number, note?: string) => {
      const line: CartLine = {
        lineId: randomId(),
        mealId: meal.id,
        name: meal.name,
        image: meal.image,
        emoji: meal.emoji,
        unitPrice: meal.price,
        quantity,
        selections,
        note: note?.trim() ? note.trim() : undefined,
      };
      dispatch({ type: "cart:add", line });
    },
    [],
  );

  const setLineQuantity = useCallback((lineId: string, quantity: number) => {
    dispatch({ type: "cart:setQty", lineId, quantity });
  }, []);

  const removeLine = useCallback((lineId: string) => {
    dispatch({ type: "cart:remove", lineId });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "cart:clear" }), []);

  /* ---- orders ---- */

  const placeOrder = useCallback(
    (input: PlaceOrderInput): Order | null => {
      const cart = stateRef.current.cart;
      if (cart.length === 0) return null; // guards against duplicate submissions

      const now = new Date().toISOString();
      const settings = stateRef.current.settings;
      const subtotal = cart.reduce((sum, line) => sum + lineTotal(line), 0);
      const deliveryFee = deliveryFeeFor(subtotal, settings, input.fulfillment);
      const order: Order = {
        ref: generateOrderRef(),
        createdAt: now,
        customer: {
          name: input.customer.name.trim(),
          phone: input.customer.phone.trim(),
          email: input.customer.email?.trim() || undefined,
        },
        fulfillment: input.fulfillment,
        address: input.fulfillment === "delivery" ? input.address?.trim() : undefined,
        notes: input.notes?.trim() || undefined,
        paymentMethod: input.paymentMethod,
        paymentStatus:
          input.paymentMethod === "demo-payment" ? "paid-demo" : "unpaid",
        items: cart,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        status: "pending",
        history: [{ status: "pending", at: now }],
      };

      dispatch({
        type: "patch",
        patch: { orders: [order, ...stateRef.current.orders], cart: [] },
      });

      backend.createOrder(order).catch((error) => {
        if (isOffline()) {
          enqueue({ id: `order.create:${order.ref}`, kind: "order.create", order });
          setSyncError(
            `You're offline — order ${order.ref} is saved on this device and will be sent automatically.`,
          );
          return;
        }
        setSyncError(
          describeBackendError(
            error,
            `Order ${order.ref} could not be sent to the kitchen. Keep your reference and try again.`,
          ),
        );
      });

      return order;
    },
    [enqueue, setSyncError],
  );

  const updateOrderStatus = useCallback(
    (ref: string, status: OrderStatus) => {
      const before = stateRef.current.orders;
      const next = before.map((order) =>
        order.ref === ref
          ? {
              ...order,
              status,
              history: [...order.history, { status, at: new Date().toISOString() }],
            }
          : order,
      );
      dispatch({ type: "patch", patch: { orders: next } });

      backend.updateOrderStatus(ref, status).catch((error) => {
        if (isOffline()) {
          enqueue({
            id: `order.status:${ref}:${status}`,
            kind: "order.status",
            ref,
            status,
          });
          setSyncError(
            "You're offline — the status change will be sent when the connection returns.",
          );
          return;
        }
        dispatch({ type: "patch", patch: { orders: before } });
        setSyncError(describeBackendError(error, "Could not update the order status."));
      });
    },
    [enqueue, setSyncError],
  );

  const seedSampleOrders = useCallback((): number => {
    const sample = makeSampleOrders(stateRef.current.meals, stateRef.current.settings);
    const before = stateRef.current.orders;
    dispatch({ type: "patch", patch: { orders: [...sample, ...before] } });
    backend.createOrders(sample).catch((error) => {
      dispatch({ type: "patch", patch: { orders: before } });
      setSyncError(describeBackendError(error, "Could not save the sample orders."));
    });
    return sample.length;
  }, [setSyncError]);

  const loadOrderByRef = useCallback(
    async (ref: string): Promise<Order | null> => {
      const target = normaliseRef(ref);
      const cached = stateRef.current.orders.find(
        (order) => normaliseRef(order.ref) === target,
      );
      if (cached) return cached;
      try {
        return await backend.getOrderByRef(target);
      } catch (error) {
        setSyncError(describeBackendError(error, "Could not look up that order."));
        return null;
      }
    },
    [setSyncError],
  );

  const lookupOrder = useCallback(
    async (ref: string, phone: string): Promise<Order | null> => {
      const target = normaliseRef(ref);
      const cached = stateRef.current.orders.find(
        (order) =>
          normaliseRef(order.ref) === target && phoneMatches(order.customer.phone, phone),
      );
      if (cached) return cached;
      return backend.findOrder(target, phone);
    },
    [],
  );

  /* ---- catalogue ---- */

  const addMeal = useCallback(
    (input: Omit<Meal, "id">): Meal => {
      const meal: Meal = { ...input, id: randomId() };
      const before = stateRef.current.meals;
      void optimistic(
        { meals: [...before, meal] },
        { meals: before },
        () => backend.createMeal(meal),
        "Could not save the new meal.",
      );
      return meal;
    },
    [optimistic],
  );

  const updateMeal = useCallback(
    (meal: Meal) => {
      const before = stateRef.current.meals;
      void optimistic(
        { meals: before.map((item) => (item.id === meal.id ? meal : item)) },
        { meals: before },
        () => backend.updateMeal(meal),
        "Could not save the meal changes.",
      );
    },
    [optimistic],
  );

  const removeMeal = useCallback(
    (mealId: string) => {
      const before = stateRef.current.meals;
      void optimistic(
        { meals: before.filter((item) => item.id !== mealId) },
        { meals: before },
        () => backend.deleteMeal(mealId),
        "Could not delete the meal.",
      );
    },
    [optimistic],
  );

  const addCategory = useCallback(
    (name: string, emoji: string): Category => {
      const category: Category = {
        id:
          name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
          randomId(),
        name: name.trim(),
        emoji: emoji.trim() || "🍽️",
      };
      const before = stateRef.current.categories;
      void optimistic(
        { categories: [...before, category] },
        { categories: before },
        () => backend.createCategory(category),
        "Could not add the category.",
      );
      return category;
    },
    [optimistic],
  );

  const updateCategory = useCallback(
    (category: Category) => {
      const before = stateRef.current.categories;
      void optimistic(
        {
          categories: before.map((item) =>
            item.id === category.id ? category : item,
          ),
        },
        { categories: before },
        () => backend.updateCategory(category),
        "Could not update the category.",
      );
    },
    [optimistic],
  );

  const removeCategory = useCallback(
    async (id: string): Promise<{ ok: boolean; error?: string }> => {
      if (stateRef.current.meals.some((meal) => meal.categoryId === id)) {
        return {
          ok: false,
          error: "This category still has meals. Move or delete them first.",
        };
      }
      const before = stateRef.current.categories;
      dispatch({
        type: "patch",
        patch: { categories: before.filter((item) => item.id !== id) },
      });
      try {
        await backend.deleteCategory(id);
        return { ok: true };
      } catch (error) {
        dispatch({ type: "patch", patch: { categories: before } });
        const message = describeBackendError(error, "Could not delete the category.");
        setSyncError(message);
        return { ok: false, error: message };
      }
    },
    [setSyncError],
  );

  const updateSettings = useCallback(
    (settings: Settings) => {
      const before = stateRef.current.settings;
      void optimistic(
        { settings },
        { settings: before },
        () => backend.updateSettings(settings),
        "Could not save the settings.",
      );
    },
    [optimistic],
  );

  const resetDemoData = useCallback(async () => {
    try {
      await backend.resetDemoData();
      const snapshot: Snapshot = await backend.load();
      dispatch({ type: "patch", patch: { ...snapshot, cart: [], syncError: null } });
      persistOutbox([]);
    } catch (error) {
      setSyncError(describeBackendError(error, "Could not reset the demo data."));
    }
  }, [persistOutbox, setSyncError]);

  /* ---- auth ---- */

  const login = useCallback(
    async (code: string): Promise<boolean> => {
      const session = await backend.signIn(code);
      if (!session) return false;
      dispatch({ type: "patch", patch: { staff: session, adminAuthed: true } });
      return true;
    },
    [],
  );

  const logout = useCallback(() => {
    dispatch({ type: "patch", patch: { staff: null, adminAuthed: false } });
    backend.signOut().catch(() => {
      // Nothing actionable — the local session is already cleared.
    });
  }, []);

  /* ---- ui ---- */

  const setSearchQuery = useCallback(
    (query: string) => dispatch({ type: "ui:search", query }),
    [],
  );
  const setCategoryFilter = useCallback(
    (id: string) => dispatch({ type: "ui:category", id }),
    [],
  );

  const value = useMemo(
    () => ({
      ...state,
      addToCart,
      setLineQuantity,
      removeLine,
      clearCart,
      placeOrder,
      updateOrderStatus,
      seedSampleOrders,
      loadOrderByRef,
      lookupOrder,
      addMeal,
      updateMeal,
      removeMeal,
      addCategory,
      updateCategory,
      removeCategory,
      updateSettings,
      resetDemoData,
      login,
      logout,
      refreshOrders,
      setSearchQuery,
      setCategoryFilter,
      clearSyncError,
      pendingWrites,
      retryPending,
    }),
    [
      state,
      addToCart,
      setLineQuantity,
      removeLine,
      clearCart,
      placeOrder,
      updateOrderStatus,
      seedSampleOrders,
      loadOrderByRef,
      lookupOrder,
      addMeal,
      updateMeal,
      removeMeal,
      addCategory,
      updateCategory,
      removeCategory,
      updateSettings,
      resetDemoData,
      login,
      logout,
      refreshOrders,
      setSearchQuery,
      setCategoryFilter,
      clearSyncError,
      pendingWrites,
      retryPending,
    ],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      {state.syncError && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-xl sm:inset-x-auto sm:right-4">
          <div className="flex items-start gap-3">
            <p className="flex-1 leading-relaxed">
              <span className="font-bold">Sync problem · </span>
              {state.syncError}
            </p>
            <button
              type="button"
              onClick={clearSyncError}
              aria-label="Dismiss"
              className="-mr-1 -mt-1 rounded-full px-2 text-lg leading-none text-red-500 transition hover:text-red-700"
            >
              ×
            </button>
          </div>
          {pendingWrites > 0 && (
            <div className="mt-2 flex items-center gap-2 border-t border-red-200 pt-2 text-xs">
              <span>
                {pendingWrites} change{pendingWrites === 1 ? "" : "s"} waiting to sync.
              </span>
              <button
                type="button"
                onClick={() => void retryPending()}
                className="font-semibold underline"
              >
                Retry now
              </button>
            </div>
          )}
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreState & StoreActions {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/** Live cart summary used by the header badge and cart page. */
export function useCartTotals() {
  const { cart } = useStore();
  return useMemo(() => {
    const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = cart.reduce((sum, line) => sum + lineTotal(line), 0);
    return { itemCount, subtotal };
  }, [cart]);
}
