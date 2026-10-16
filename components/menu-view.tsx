"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MealCard } from "@/components/meal-card";
import { EmptyState } from "@/components/ui";
import { SearchIcon } from "@/components/icons";
import { useStore } from "@/lib/store";

export function MenuView() {
  const searchParams = useSearchParams();
  const {
    meals,
    categories,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    hydrated,
  } = useStore();

  // Honour a ?category=... deep link (e.g. from the home page category cards).
  const urlCategory = searchParams.get("category");
  useEffect(() => {
    if (urlCategory) setCategoryFilter(urlCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory]);

  const categoryById = (id: string) => categories.find((c) => c.id === id);

  const results = useMemo(() => {
    const terms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = meals.filter((meal) => {
      if (categoryFilter !== "all" && meal.categoryId !== categoryFilter) return false;
      if (terms.length === 0) return true;
      const haystack = [
        meal.name,
        meal.description,
        categoryById(meal.categoryId)?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
    // Available items first, sold-out items last.
    return [...filtered].sort((a, b) => Number(b.available) - Number(a.available));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meals, categories, searchQuery, categoryFilter]);

  const activeCategoryName =
    categoryFilter === "all" ? null : categoryById(categoryFilter)?.name;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="section-title">Our menu</h1>
        <p className="section-sub">
          Freshly prepared Nigerian favourites. Search, filter by category and
          customise each meal to your taste.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-300" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="input pl-10"
            placeholder="Search jollof, burger, pizza..."
            aria-label="Search the menu"
            type="search"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`chip ${categoryFilter === "all" ? "chip-active" : ""}`}
          >
            All meals
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryFilter(category.id)}
              className={`chip ${categoryFilter === category.id ? "chip-active" : ""}`}
            >
              <span aria-hidden>{category.emoji}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-charcoal-500">
        {hydrated
          ? `${results.length} item${results.length === 1 ? "" : "s"}`
          : "Loading menu…"}
        {activeCategoryName ? ` in ${activeCategoryName}` : ""}
        {searchQuery.trim() ? ` matching “${searchQuery.trim()}”` : ""}
      </p>

      {!hydrated ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-[4/3] animate-pulse bg-cream-200" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-cream-200" />
                <div className="h-3 w-full animate-pulse rounded bg-cream-200" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            emoji="🔍"
            title="No meals found"
            message="We couldn't find anything matching your search. Try a different keyword or browse another category."
          >
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
              className="btn btn-primary btn-sm"
            >
              Clear filters
            </button>
          </EmptyState>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((meal) => (
            <MealCard key={meal.id} meal={meal} category={categoryById(meal.categoryId)} />
          ))}
        </div>
      )}
    </div>
  );
}
