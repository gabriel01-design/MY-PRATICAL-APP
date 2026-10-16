import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-charcoal-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-charcoal-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SummaryCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "brand" | "leaf" | "amber";
  icon?: ReactNode;
}) {
  const tones: Record<string, string> = {
    default: "bg-charcoal-900/5 text-charcoal-700",
    brand: "bg-brand-50 text-brand-600",
    leaf: "bg-leaf-100 text-leaf-500",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-300">
          {label}
        </p>
        {icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${tones[tone]}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-black text-charcoal-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-charcoal-300">{hint}</p>}
    </div>
  );
}
