"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/summary-card";
import { PencilIcon, TrashIcon } from "@/components/icons";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

export function CategoriesManager() {
  const { categories, meals, addCategory, updateCategory, removeCategory, hydrated } =
    useStore();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  function flash(type: "ok" | "err", text: string) {
    setFeedback({ type, text });
    window.setTimeout(() => setFeedback(null), 2600);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      flash("err", "Category name is required.");
      return;
    }
    if (editing) {
      updateCategory({ ...editing, name: name.trim(), emoji: emoji.trim() || "🍽️" });
      flash("ok", `Updated “${name.trim()}”.`);
    } else {
      addCategory(name, emoji);
      flash("ok", `Added “${name.trim()}”.`);
    }
    setName("");
    setEmoji("");
    setEditing(null);
  }

  function startEdit(category: Category) {
    setEditing(category);
    setName(category.name);
    setEmoji(category.emoji);
  }

  async function remove(category: Category) {
    const result = await removeCategory(category.id);
    if (!result.ok) flash("err", result.error ?? "Could not delete category.");
    else flash("ok", `Deleted “${category.name}”.`);
  }

  return (
    <div>
      <AdminPageHeader
        title="Food Categories"
        description="Organise the menu into categories customers can filter by."
      />

      {feedback && (
        <div
          role="status"
          className={`mb-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
            feedback.type === "ok" ? "bg-leaf-100 text-leaf-500" : "bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card overflow-hidden">
          {!hydrated ? (
            <p className="p-6 text-sm text-charcoal-300">Loading categories…</p>
          ) : categories.length === 0 ? (
            <p className="p-10 text-center text-sm text-charcoal-500">
              No categories yet. Add one to get started.
            </p>
          ) : (
            <ul className="divide-y divide-charcoal-900/5">
              {categories.map((category) => {
                const count = meals.filter((m) => m.categoryId === category.id).length;
                return (
                  <li
                    key={category.id}
                    className="flex items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-lg">
                        {category.emoji}
                      </span>
                      <div>
                        <p className="font-semibold text-charcoal-900">{category.name}</p>
                        <p className="text-xs text-charcoal-300">
                          {count} meal{count === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal-500 transition hover:bg-brand-50 hover:text-brand-600"
                        aria-label={`Edit ${category.name}`}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(category)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal-500 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${category.name}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <form onSubmit={submit} className="card h-fit p-5">
          <h2 className="text-lg font-bold text-charcoal-900">
            {editing ? "Edit category" : "Add category"}
          </h2>
          <label className="mt-4 block">
            <span className="label">Name</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Desserts"
            />
          </label>
          <label className="mt-4 block">
            <span className="label">Emoji</span>
            <input
              className="input"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="🍰"
              maxLength={4}
            />
          </label>
          <div className="mt-5 flex gap-3">
            <button type="submit" className="btn btn-primary btn-md flex-1">
              {editing ? "Save" : "Add category"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setName("");
                  setEmoji("");
                }}
                className="btn btn-outline btn-md"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
