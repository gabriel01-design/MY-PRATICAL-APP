const nairaFormatter = new Intl.NumberFormat("en-NG", {
  maximumFractionDigits: 0,
});

/** Format a naira amount, e.g. 3500 -> "₦3,500". */
export function formatNaira(amount: number): string {
  return `₦${nairaFormatter.format(Math.round(amount))}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** e.g. "4m 12s" since order creation — used by the kitchen display. */
export function elapsedLabel(iso: string, now: number): string {
  const seconds = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}m ${s}s`;
}
