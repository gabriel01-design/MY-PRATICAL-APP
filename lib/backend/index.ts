import { isSupabaseConfigured } from "@/lib/supabase/client";
import { localBackend } from "@/lib/backend/local";
import { supabaseBackend } from "@/lib/backend/supabase";
import type { DataBackend } from "@/lib/backend/types";

/**
 * Single place that decides where data comes from.
 *
 * Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to switch the
 * whole app to Supabase; without them the localStorage demo backend is used so
 * the project keeps working out of the box.
 */
export const backend: DataBackend = isSupabaseConfigured()
  ? supabaseBackend
  : localBackend;

/** True when running against the in-browser demo data. */
export const isDemoMode = backend.id === "local";

export type { DataBackend, Snapshot, StaffSession } from "@/lib/backend/types";
