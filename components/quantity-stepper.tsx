"use client";

import { MinusIcon, PlusIcon } from "@/components/icons";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  ariaLabel?: string;
}

/**
 * Accessible +/- quantity control. Never drops below `min` (default 1);
 * pages that allow removal handle the "at minimum" case via their own button.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  ariaLabel = "Quantity",
}: QuantityStepperProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-charcoal-900/10 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`flex ${dim} items-center justify-center rounded-full text-charcoal-700 transition hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label={`Decrease ${ariaLabel.toLowerCase()}`}
      >
        <MinusIcon className={icon} />
      </button>
      <span
        className="min-w-6 text-center text-sm font-bold text-charcoal-900"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`flex ${dim} items-center justify-center rounded-full text-charcoal-700 transition hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label={`Increase ${ariaLabel.toLowerCase()}`}
      >
        <PlusIcon className={icon} />
      </button>
    </div>
  );
}
