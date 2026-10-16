/**
 * Hand-maintained Supabase schema types. They mirror supabase/schema.sql and are
 * intentionally shaped like `supabase gen types typescript` output so the file
 * can be swapped for the generated version:
 *
 *   supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatusDb =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "rejected"
  | "cancelled";

export type FulfillmentDb = "delivery" | "pickup";
export type PaymentMethodDb = "pay-on-delivery" | "demo-payment";
export type PaymentStatusDb = "unpaid" | "paid-demo";
export type StaffRoleDb = "admin" | "kitchen" | "customer";

export type CategoryRow = {
  id: string;
  name: string;
  emoji: string;
  sort_order: number;
  created_at: string;
};

export type MealRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string | null;
  image: string;
  emoji: string;
  available: boolean;
  featured: boolean;
  popular: boolean;
  options: Json;
  created_at: string;
};

export type OrderRow = {
  ref: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfillment: FulfillmentDb;
  address: string | null;
  notes: string | null;
  payment_method: PaymentMethodDb;
  payment_status: PaymentStatusDb;
  items: Json;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatusDb;
  history: Json;
};

export type SettingsRow = {
  id: number;
  restaurant_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  opening_hours: string;
  delivery_fee: number;
  free_delivery_over: number;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string;
  role: StaffRoleDb;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: {
          id: string;
          name: string;
          emoji?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          emoji?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      meals: {
        Row: MealRow;
        Insert: {
          id: string;
          name: string;
          description?: string;
          price: number;
          category_id?: string | null;
          image?: string;
          emoji?: string;
          available?: boolean;
          featured?: boolean;
          popular?: boolean;
          options?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          category_id?: string | null;
          image?: string;
          emoji?: string;
          available?: boolean;
          featured?: boolean;
          popular?: boolean;
          options?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: {
          ref: string;
          created_at?: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          fulfillment?: FulfillmentDb;
          address?: string | null;
          notes?: string | null;
          payment_method?: PaymentMethodDb;
          payment_status?: PaymentStatusDb;
          items?: Json;
          subtotal?: number;
          delivery_fee?: number;
          total?: number;
          status?: OrderStatusDb;
          history?: Json;
        };
        Update: {
          ref?: string;
          created_at?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          fulfillment?: FulfillmentDb;
          address?: string | null;
          notes?: string | null;
          payment_method?: PaymentMethodDb;
          payment_status?: PaymentStatusDb;
          items?: Json;
          subtotal?: number;
          delivery_fee?: number;
          total?: number;
          status?: OrderStatusDb;
          history?: Json;
        };
        Relationships: [];
      };
      settings: {
        Row: SettingsRow;
        Insert: {
          id?: number;
          restaurant_name?: string;
          tagline?: string;
          phone?: string;
          email?: string;
          address?: string;
          opening_hours?: string;
          delivery_fee?: number;
          free_delivery_over?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          restaurant_name?: string;
          tagline?: string;
          phone?: string;
          email?: string;
          address?: string;
          opening_hours?: string;
          delivery_fee?: number;
          free_delivery_over?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string;
          role?: StaffRoleDb;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string;
          role?: StaffRoleDb;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      current_role: {
        Args: Record<never, never>;
        Returns: StaffRoleDb;
      };
      is_staff: {
        Args: Record<never, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<never, never>;
        Returns: boolean;
      };
      get_order_by_ref: {
        Args: { p_ref: string };
        Returns: OrderRow[];
      };
      find_order: {
        Args: { p_ref: string; p_phone: string };
        Returns: OrderRow[];
      };
      set_order_status: {
        Args: { p_ref: string; p_status: OrderStatusDb };
        Returns: OrderRow[];
      };
    };
    Enums: {
      order_status: OrderStatusDb;
      fulfillment_type: FulfillmentDb;
      payment_method: PaymentMethodDb;
      payment_status: PaymentStatusDb;
      staff_role: StaffRoleDb;
    };
    CompositeTypes: Record<never, never>;
  };
}
