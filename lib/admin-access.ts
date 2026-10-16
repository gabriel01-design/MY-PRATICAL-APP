import type { StaffSession } from "@/lib/backend/types";

/**
 * Staff access gate.
 *
 * The admin portal and the kitchen board are unlocked by a single shared access
 * code instead of a username/password. This is demo-grade protection: the code
 * is bundled into the browser, so it keeps casual visitors out of the staff UI
 * but is not real authentication. When a Supabase backend is configured the
 * database still enforces its own rules on every write.
 */

const STORAGE_KEY = "mama-chidis-admin-v1";

/** Override with NEXT_PUBLIC_ADMIN_ACCESS_CODE (see .env.example). */
export const ADMIN_ACCESS_CODE =
  process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE?.trim() || "MAMACHEF";

function normalize(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export function isValidAccessCode(code: string): boolean {
  return normalize(code) === normalize(ADMIN_ACCESS_CODE);
}

export function isStaffUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "granted";
  } catch {
    return false;
  }
}

export function setStaffUnlocked(unlocked: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (unlocked) window.localStorage.setItem(STORAGE_KEY, "granted");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked — the session simply won't persist across refreshes.
  }
}

export function staffSession(): StaffSession {
  return { id: "staff", email: "", name: "Staff", role: "admin" };
}
