"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/summary-card";
import { FoodImage } from "@/components/food-image";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import type { Meal } from "@/lib/types";

interface Draft {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  image: string;
  emoji: string;
  available: boolean;
  featured: boolean;
  popular: boolean;
}

const EMPTY_DRAFT: Draft = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  image: "",
  emoji: "🍽️",
  available: true,
  featured: false,
  popular: false,
};

export function MenuManager() {
  const { meals, categories, addMeal, updateMeal, removeMeal, hydrated } = useStore();
  const [editing, setEditing] = useState<Meal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<Meal | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setDraft({ ...EMPTY_DRAFT, categoryId: categories[0]?.id ?? "" });
    setErrors({});
    setShowForm(true);
  }

  function openEdit(meal: Meal) {
    setEditing(meal);
    setDraft({
      name: meal.name,
      description: meal.description,
      price: String(meal.price),
      categoryId: meal.categoryId,
      image: meal.image,
      emoji: meal.emoji,
      available: meal.available,
      featured: meal.featured,
      popular: meal.popular,
    });
    setErrors({});
    setShowForm(true);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = "Name is required.";
    const price = Number(draft.price);
    if (!draft.price.trim()) next.price = "Price is required.";
    else if (!Number.isFinite(price) || price <= 0)
      next.price = "Enter a price greater than zero.";
    if (!draft.categoryId) next.categoryId = "Choose a category.";
    if (!draft.image.trim()) next.image = "An image URL is required.";
    else if (!/^https?:\/\//.test(draft.image.trim()))
      next.image = "Image must be a valid http(s) URL.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    const base = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: Math.round(Number(draft.price)),
      categoryId: draft.categoryId,
      image: draft.image.trim(),
      emoji: draft.emoji.trim() || "🍽️",
      available: draft.available,
      featured: draft.featured,
      popular: draft.popular,
    };
    if (editing) {
      updateMeal({ ...editing, ...base });
      setFeedback(`Updated “${base.name}”.`);
    } else {
      addMeal({ ...base, options: [] });
      setFeedback(`Added “${base.name}”.`);
    }
    setShowForm(false);
    setEditing(null);
    window.setTimeout(() => setFeedback(null), 2500);
  }

  function confirmRemove() {
    if (!confirmDelete) return;
    removeMeal(confirmDelete.id);
    setFeedback(`Removed “${confirmDelete.name}”.`);
    setConfirmDelete(null);
    window.setTimeout(() => setFeedback(null), 2500);
  }

  function toggleAvailability(meal: Meal) {
    updateMeal({ ...meal, available: !meal.available });
  }

  return (
    <div>
      <AdminPageHeader
        title="Menu Management"
        description="Add, edit and retire dishes. Changes appear instantly on the customer menu."
        action={
          <button type="button" onClick={openAdd} className="btn btn-primary btn-sm">
            <PlusIcon className="h-4 w-4" /> Add meal
          </button>
        }
      />

      {feedback && (
        <div role="status" className="mb-4 rounded-2xl bg-leaf-100 px-4 py-3 text-sm font-semibold text-leaf-500">
          {feedback}
        </div>
      )}

      {!hydrated ? (
        <p className="text-sm text-charcoal-300">Loading menu…</p>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal-900/5 bg-cream-50 text-xs uppercase tracking-wide text-charcoal-300">
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-900/5">
                {meals.map((meal) => {
                  const category = categories.find((c) => c.id === meal.categoryId);
                  return (
                    <tr key={meal.id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                            <FoodImage src={meal.image} alt={meal.name} emoji={meal.emoji} sizes="44px" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-charcoal-900">{meal.name}</p>
                            <p className="truncate text-xs text-charcoal-300">
                              {meal.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-charcoal-500">
                        {category ? `${category.emoji} ${category.name}` : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-charcoal-900">
                        {formatNaira(meal.price)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleAvailability(meal)}
                          className={`badge ${
                            meal.available
                              ? "bg-leaf-100 text-leaf-500"
                              : "bg-charcoal-900 text-white"
                          }`}
                          title="Toggle availability"
                        >
                          {meal.available ? "Available" : "Sold out"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(meal)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal-500 transition hover:bg-brand-50 hover:text-brand-600"
                            aria-label={`Edit ${meal.name}`}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(meal)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal-500 transition hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${meal.name}`}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal-900/50 p-4 sm:items-center">
          <form
            onSubmit={save}
            className="my-8 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            noValidate
          >
            <h2 className="text-xl font-black text-charcoal-900">
              {editing ? "Edit meal" : "Add a meal"}
            </h2>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="label">Name</span>
                <input
                  className="input"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Classic Jollof Rice"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </label>

              <label className="block">
                <span className="label">Description</span>
                <textarea
                  className="input resize-none"
                  rows={2}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Short, appetising description"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="label">Price (₦)</span>
                  <input
                    className="input"
                    inputMode="numeric"
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                    placeholder="3500"
                  />
                  {errors.price && <span className="field-error">{errors.price}</span>}
                </label>
                <label className="block">
                  <span className="label">Category</span>
                  <select
                    className="input"
                    value={draft.categoryId}
                    onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <span className="field-error">{errors.categoryId}</span>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-[1fr_90px] gap-4">
                <label className="block">
                  <span className="label">Image URL</span>
                  <input
                    className="input"
                    value={draft.image}
                    onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                    placeholder="https://..."
                  />
                  {errors.image && <span className="field-error">{errors.image}</span>}
                </label>
                <label className="block">
                  <span className="label">Emoji</span>
                  <input
                    className="input text-center"
                    value={draft.emoji}
                    onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
                    maxLength={4}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-4">
                <Toggle
                  label="Available"
                  checked={draft.available}
                  onChange={(v) => setDraft({ ...draft, available: v })}
                />
                <Toggle
                  label="Featured"
                  checked={draft.featured}
                  onChange={(v) => setDraft({ ...draft, featured: v })}
                />
                <Toggle
                  label="Popular"
                  checked={draft.popular}
                  onChange={(v) => setDraft({ ...draft, popular: v })}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="btn btn-outline btn-md"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-md">
                {editing ? "Save changes" : "Add meal"}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <p className="text-3xl" aria-hidden>
              🗑️
            </p>
            <h2 className="mt-3 text-lg font-bold text-charcoal-900">Delete this meal?</h2>
            <p className="mt-1 text-sm text-charcoal-500">
              “{confirmDelete.name}” will be removed from the menu. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="btn btn-outline btn-md"
              >
                Cancel
              </button>
              <button type="button" onClick={confirmRemove} className="btn btn-danger btn-md">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-charcoal-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-brand-500"
      />
      {label}
    </label>
  );
}
