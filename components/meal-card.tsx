"use client";

import Link from "next/link";
import { useState } from "react";
import { FoodImage } from "@/components/food-image";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import type { Category, Meal } from "@/lib/types";

interface MealCardProps {
  meal: Meal;
  category?: Category;
  priority?: boolean;
}

/**
 * Menu item card used on the home page, menu page and category listings.
 * Meals that require a choice (e.g. "choose your protein") open the details
 * page for customisation; others support a one-tap quick add.
 */
export function MealCard({ meal, category, priority = false }: MealCardProps) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const needsChoices = meal.options.some((group) => group.required);

  function quickAdd() {
    if (!meal.available) return;
    addToCart(meal, [], 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <Link
        href={`/food/${meal.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-cream-200"
      >
        <FoodImage
          src={meal.image}
          alt={meal.name}
          emoji={meal.emoji}
          priority={priority}
          className="transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {category && (
            <span className="badge bg-white/90 text-charcoal-700 backdrop-blur">
              {category.emoji} {category.name}
            </span>
          )}
          {!meal.available && (
            <span className="badge bg-charcoal-900 text-white">Sold out</span>
          )}
        </div>
        {meal.popular && meal.available && (
          <span className="badge absolute right-3 top-3 bg-brand-500 text-white">
            Popular
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold leading-snug text-charcoal-900">
            <Link href={`/food/${meal.id}`} className="hover:text-brand-600">
              {meal.name}
            </Link>
          </h3>
          <span className="whitespace-nowrap text-base font-extrabold text-brand-600">
            {formatNaira(meal.price)}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-charcoal-500">
          {meal.description}
        </p>

        <div className="mt-4 flex items-center gap-2">
          {needsChoices ? (
            <Link href={`/food/${meal.id}`} className="btn btn-primary btn-sm flex-1">
              Customise
            </Link>
          ) : (
            <button
              type="button"
              onClick={quickAdd}
              disabled={!meal.available}
              className="btn btn-primary btn-sm flex-1"
            >
              {added ? (
                <>
                  <CheckIcon className="h-4 w-4" /> Added
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" /> Add to Cart
                </>
              )}
            </button>
          )}
          <Link
            href={`/food/${meal.id}`}
            className="btn btn-outline btn-sm"
            aria-label={`View details for ${meal.name}`}
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
