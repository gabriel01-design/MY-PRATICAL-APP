"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/summary-card";
import { useStore } from "@/lib/store";
import type { Settings } from "@/lib/types";

export function SettingsManager() {
  const { settings, updateSettings, resetDemoData, hydrated } = useStore();
  const [draft, setDraft] = useState<Settings>(settings);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [touched, setTouched] = useState(false);

  // Keep the form in sync the first time the store hydrates.
  if (hydrated && !touched && draft !== settings) {
    setDraft(settings);
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setTouched(true);
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function save(event: React.FormEvent) {
    event.preventDefault();
    updateSettings({
      ...draft,
      restaurantName: draft.restaurantName.trim() || "My Restaurant",
      deliveryFee: Math.max(0, Math.round(Number(draft.deliveryFee) || 0)),
      freeDeliveryOver: Math.max(0, Math.round(Number(draft.freeDeliveryOver) || 0)),
    });
    setTouched(false);
    setFeedback("Settings saved. The customer site now uses these details.");
    window.setTimeout(() => setFeedback(null), 2600);
  }

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Restaurant details and delivery rules used across the demo."
      />

      {feedback && (
        <div role="status" className="mb-4 rounded-2xl bg-leaf-100 px-4 py-3 text-sm font-semibold text-leaf-500">
          {feedback}
        </div>
      )}

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-lg font-bold text-charcoal-900">Restaurant details</h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="label">Restaurant name</span>
              <input
                className="input"
                value={draft.restaurantName}
                onChange={(e) => update("restaurantName", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Tagline</span>
              <input
                className="input"
                value={draft.tagline}
                onChange={(e) => update("tagline", e.target.value)}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Phone</span>
                <input
                  className="input"
                  value={draft.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="label">Email</span>
                <input
                  className="input"
                  value={draft.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </label>
            </div>
            <label className="block">
              <span className="label">Address</span>
              <input
                className="input"
                value={draft.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Opening hours</span>
              <input
                className="input"
                value={draft.openingHours}
                onChange={(e) => update("openingHours", e.target.value)}
              />
            </label>
          </div>
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="text-lg font-bold text-charcoal-900">Delivery</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Delivery fee (₦)</span>
                <input
                  className="input"
                  inputMode="numeric"
                  value={String(draft.deliveryFee)}
                  onChange={(e) => update("deliveryFee", Number(e.target.value) || 0)}
                />
              </label>
              <label className="block">
                <span className="label">Free delivery over (₦)</span>
                <input
                  className="input"
                  inputMode="numeric"
                  value={String(draft.freeDeliveryOver)}
                  onChange={(e) => update("freeDeliveryOver", Number(e.target.value) || 0)}
                />
              </label>
            </div>
            <p className="mt-3 text-xs text-charcoal-300">
              Pickup orders never pay a delivery fee.
            </p>
          </section>

          <section className="card border-red-200 p-5">
            <h2 className="text-lg font-bold text-red-700">Danger zone</h2>
            <p className="mt-1 text-sm text-charcoal-500">
              Reset all demo data (menu, orders, cart and settings) back to the original
              seed values.
            </p>
            {confirmReset ? (
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void resetDemoData();
                    setConfirmReset(false);
                    setTouched(false);
                    setFeedback("Demo data reset to defaults.");
                    window.setTimeout(() => setFeedback(null), 2600);
                  }}
                  className="btn btn-danger btn-sm"
                >
                  Yes, reset everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="btn btn-outline btn-sm mt-3 text-red-600"
              >
                Reset demo data
              </button>
            )}
          </section>
        </div>

        <div className="lg:col-span-2">
          <button type="submit" className="btn btn-primary btn-lg">
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
