"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/types";

/**
 * Resolves an order by its reference: instantly from the in-memory cache when
 * the order was placed in this session, otherwise from the backend (the
 * Supabase RPC that powers the public tracking page).
 */
export function useOrderByRef(ref: string): {
  order: Order | null;
  loading: boolean;
} {
  const { hydrated, loadOrderByRef } = useStore();
  const [resolved, setResolved] = useState<{ ref: string; order: Order | null } | null>(
    null,
  );

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    loadOrderByRef(ref)
      .then((result) => {
        if (active) setResolved({ ref, order: result });
      })
      .catch(() => {
        if (active) setResolved({ ref, order: null });
      });
    return () => {
      active = false;
    };
  }, [hydrated, ref, loadOrderByRef]);

  const match = resolved && resolved.ref === ref ? resolved.order : null;
  return { order: match, loading: !hydrated || !resolved || resolved.ref !== ref };
}
