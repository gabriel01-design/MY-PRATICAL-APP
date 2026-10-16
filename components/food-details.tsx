"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FoodImage } from "@/components/food-image";
import { QuantityStepper } from "@/components/quantity-stepper";
import { CheckIcon, ClockIcon, FireIcon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import type { CartSelection } from "@/lib/types";

export function FoodDetails({ mealId }: { mealId: string }) {
  const router = useRouter();
  const { meals, categories, addToCart, hydrated } = useStore();
  const meal = meals.find((item) => item.id === mealId);
  const category = meal ? categories.find((c) => c.id === meal.categoryId) : undefined;

  // groupId -> choiceId for single-select groups.
  const [singleChoices, setSingleChoices] = useState<Record<string, string>>({});
  const [multiChoices, setMultiChoices] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selections = useMemo<CartSelection[]>(() => {
    if (!meal) return [];
    const result: CartSelection[] = [];
    for (const group of meal.options) {
      if (group.type === "single") {
        const choiceId = singleChoices[group.id];
        if (!choiceId) continue;
        const choice = group.choices.find((c) => c.id === choiceId);
        if (!choice) continue;
        result.push({
          groupId: group.id,
          groupName: group.name,
          choiceNames: [choice.name],
          extra: choice.price,
        });
      } else {
        const chosen = multiChoices[group.id] ?? [];
        const choices = group.choices.filter((c) => chosen.includes(c.id));
        if (choices.length === 0) continue;
        result.push({
          groupId: group.id,
          groupName: group.name,
          choiceNames: choices.map((c) => c.name),
          extra: choices.reduce((sum, c) => sum + c.price, 0),
        });
      }
    }
    return result;
  }, [meal, singleChoices, multiChoices]);

  const extras = selections.reduce((sum, selection) => sum + selection.extra, 0);
  const unitPrice = (meal?.price ?? 0) + extras;
  const lineTotal = unitPrice * quantity;

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-cream-200" />
          <div className="space-y-4">
            <div className="h-8 w-1/2 animate-pulse rounded bg-cream-200" />
            <div className="h-4 w-full animate-pulse rounded bg-cream-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-cream-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-5xl" aria-hidden>
          🍽️
        </p>
        <h1 className="mt-4 text-2xl font-bold text-charcoal-900">Meal not found</h1>
        <p className="mt-2 text-sm text-charcoal-500">
          This dish may have been removed from the menu.
        </p>
        <Link href="/menu" className="btn btn-primary btn-md mt-6">
          Back to menu
        </Link>
      </div>
    );
  }

  function addToCartWithValidation() {
    if (!meal) return;
    const missing = meal.options.find(
      (group) => group.required && group.type === "single" && !singleChoices[group.id],
    );
    if (missing) {
      setError(`Please choose an option for “${missing.name}”.`);
      return;
    }
    setError(null);
    addToCart(meal, selections, quantity, note);
    setAdded(true);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-charcoal-300" aria-label="Breadcrumb">
        <Link href="/menu" className="font-medium text-charcoal-500 hover:text-brand-600">
          Menu
        </Link>
        <span>/</span>
        {category && (
          <>
            <Link
              href={`/menu?category=${category.id}`}
              className="font-medium text-charcoal-500 hover:text-brand-600"
            >
              {category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="font-semibold text-charcoal-700">{meal.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-cream-200 shadow-lg">
            <FoodImage src={meal.image} alt={meal.name} emoji={meal.emoji} priority sizes="(max-width: 1024px) 100vw, 50vw" />
            {!meal.available && (
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal-900/60">
                <span className="badge bg-white text-charcoal-900">Currently sold out</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <span className="badge bg-brand-50 text-brand-700">
                {category.emoji} {category.name}
              </span>
            )}
            {meal.popular && (
              <span className="badge bg-amber-100 text-amber-800">
                <FireIcon className="h-3.5 w-3.5" /> Popular
              </span>
            )}
            {meal.available ? (
              <span className="badge bg-leaf-100 text-leaf-500">
                <CheckIcon className="h-3.5 w-3.5" /> Available
              </span>
            ) : (
              <span className="badge bg-red-100 text-red-700">Sold out</span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-charcoal-900 sm:text-4xl">
            {meal.name}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-charcoal-500">{meal.description}</p>
          <p className="mt-4 text-2xl font-extrabold text-brand-600">{formatNaira(meal.price)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-charcoal-300">
            <ClockIcon className="h-3.5 w-3.5" /> Estimated prep time: 20–30 minutes
          </p>

          {meal.options.length > 0 && (
            <div className="mt-8 space-y-6">
              {meal.options.map((group) => (
                <fieldset key={group.id} className="card p-5">
                  <legend className="flex w-full items-center justify-between gap-2 px-1">
                    <span className="text-sm font-bold text-charcoal-900">{group.name}</span>
                    <span className="text-xs font-medium text-charcoal-300">
                      {group.required ? "Required" : "Optional"}
                    </span>
                  </legend>
                  <div className="mt-3 grid gap-2">
                    {group.choices.map((choice) => {
                      const checked =
                        group.type === "single"
                          ? singleChoices[group.id] === choice.id
                          : (multiChoices[group.id] ?? []).includes(choice.id);
                      return (
                        <label
                          key={choice.id}
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                            checked
                              ? "border-brand-400 bg-brand-50"
                              : "border-charcoal-900/10 hover:border-brand-200"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type={group.type === "single" ? "radio" : "checkbox"}
                              name={group.id}
                              checked={checked}
                              onChange={() => {
                                setError(null);
                                if (group.type === "single") {
                                  setSingleChoices((prev) => ({
                                    ...prev,
                                    [group.id]: choice.id,
                                  }));
                                } else {
                                  setMultiChoices((prev) => {
                                    const current = prev[group.id] ?? [];
                                    return {
                                      ...prev,
                                      [group.id]: current.includes(choice.id)
                                        ? current.filter((id) => id !== choice.id)
                                        : [...current, choice.id],
                                    };
                                  });
                                }
                              }}
                              className="h-4 w-4 accent-brand-500"
                            />
                            <span className="font-medium text-charcoal-900">{choice.name}</span>
                          </span>
                          <span className="whitespace-nowrap text-sm font-semibold text-charcoal-500">
                            {choice.price > 0 ? `+ ${formatNaira(choice.price)}` : "Included"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          <div className="mt-8">
            <label htmlFor="meal-note" className="label">
              Special instructions (optional)
            </label>
            <textarea
              id="meal-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              maxLength={200}
              className="input resize-none"
              placeholder="e.g. No onions, extra sauce on the side"
            />
          </div>

          {error && <p className="field-error mt-3">{error}</p>}

          <div className="sticky bottom-0 mt-8 rounded-3xl border border-charcoal-900/5 bg-white/95 p-4 shadow-lg backdrop-blur sm:static sm:shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <QuantityStepper value={quantity} onChange={setQuantity} ariaLabel="Quantity" />
              <div className="text-right">
                <p className="text-xs font-medium text-charcoal-300">Line total</p>
                <p className="text-2xl font-extrabold text-charcoal-900">
                  {formatNaira(lineTotal)}
                </p>
              </div>
            </div>

            {added ? (
              <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-leaf-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-sm font-semibold text-leaf-500">
                  <CheckIcon className="h-4 w-4" /> Added to your cart
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdded(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Add more
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/cart")}
                    className="btn btn-primary btn-sm"
                  >
                    View cart
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={addToCartWithValidation}
                disabled={!meal.available}
                className="btn btn-primary btn-lg mt-4 w-full"
              >
                {meal.available ? `Add to cart · ${formatNaira(lineTotal)}` : "Sold out"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
