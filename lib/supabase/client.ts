import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type SupabaseBrowserClient = SupabaseClient<Database>;

/** Public config; safe to expose to the browser (protected by RLS). */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Supabase's browser key. Newer projects issue a "publishable" key
 * (`sb_publishable_...`); older ones use an "anon" key (a JWT). Either works.
 */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

/**
 * The app runs against Supabase as soon as both env vars are present.
 * Without them it falls back to the in-browser demo backend.
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

let cached: SupabaseBrowserClient | null = null;

/** Lazily create a single browser client (safe to call from client components). */
export function getSupabaseClient(): SupabaseBrowserClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }
  if (!cached) {
    cached = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        // Keep the staff session separate from anything else on the origin.
        storageKey: "mama-chidis-staff-auth",
      },
    });
  }
  return cached;
}
