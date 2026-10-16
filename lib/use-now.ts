"use client";

import { useSyncExternalStore } from "react";

/**
 * Cross-environment time helpers built on useSyncExternalStore so that:
 * - the server snapshot is deterministic (no `new Date()` during prerender), and
 * - no state is mutated inside an effect (keeps the React hooks lint happy).
 */

const noopSubscribe = () => () => {};

/** Current year on the client, `null` during SSR/hydration. */
export function useCurrentYear(): number | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => new Date().getFullYear(),
    () => null,
  );
}

/**
 * A ticking timestamp quantised to `intervalMs`, or `null` on the server.
 * Used by the kitchen display to show live elapsed times.
 */
export function useNow(intervalMs = 1000): number | null {
  return useSyncExternalStore(
    (onStoreChange) => {
      const id = window.setInterval(onStoreChange, intervalMs);
      return () => window.clearInterval(id);
    },
    () => Date.now() - (Date.now() % intervalMs),
    () => null,
  );
}
