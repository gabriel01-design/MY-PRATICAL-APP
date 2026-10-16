import type { ReactNode } from "react";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { StarIcon } from "@/components/icons";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  preparing: "bg-brand-100 text-brand-700",
  ready: "bg-leaf-100 text-leaf-500",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-charcoal-900/10 text-charcoal-500",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`badge ${STATUS_STYLES[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-charcoal-300">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export function EmptyState({
  emoji,
  title,
  message,
  children,
}: {
  emoji: string;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-3xl">
        {emoji}
      </div>
      <h3 className="text-lg font-bold text-charcoal-900">{title}</h3>
      <p className="max-w-md text-sm text-charcoal-500">{message}</p>
      {children && <div className="mt-2 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9 text-base" : "h-11 w-11 text-lg";
  return (
    <span
      className={`${box} flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 font-black text-white shadow-lg shadow-brand-500/25`}
    >
      MC
    </span>
  );
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} filled={star <= rating} className="h-4 w-4" />
      ))}
    </div>
  );
}
