"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { EmptyState } from "@/components/ui";
import { CheckIcon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { formatNaira } from "@/lib/format";
import { deliveryFeeFor, lineTotal, type Fulfillment, type PaymentMethod } from "@/lib/types";

interface FormState {
  name: string;
  phone: string;
  email: string;
  fulfillment: Fulfillment;
  address: string;
  notes: string;
  paymentMethod: PaymentMethod;
}

type Errors = Partial<Record<keyof FormState, string>>;

const PHONE_PATTERN = /^[+]?[\d\s()-]{7,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digitCount(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

export function CheckoutView() {
  const router = useRouter();
  const { cart, settings, placeOrder, hydrated } = useStore();

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    fulfillment: "delivery",
    address: "",
    notes: "",
    paymentMethod: "pay-on-delivery",
  });
  const [errors, setErrors] = useState<Errors>({});
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, line) => sum + lineTotal(line), 0);
  const deliveryFee = deliveryFeeFor(subtotal, settings, form.fulfillment);
  const total = subtotal + deliveryFee;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Please enter your full name.";
    else if (form.name.trim().length < 2) next.name = "That name looks too short.";

    if (!form.phone.trim()) next.phone = "Please enter your phone number.";
    else if (!PHONE_PATTERN.test(form.phone.trim()) || digitCount(form.phone) < 10)
      next.phone = "Enter a valid phone number (at least 10 digits).";

    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim()))
      next.email = "Enter a valid email address or leave it blank.";

    if (form.fulfillment === "delivery") {
      if (!form.address.trim()) next.address = "A delivery address is required.";
      else if (form.address.trim().length < 5)
        next.address = "Please enter a more complete address.";
    }

    return next;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submittingRef.current) return; // guard against rapid double clicks
    if (cart.length === 0) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      document
        .querySelector<HTMLElement>("[data-error='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const order = placeOrder({
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
        },
        fulfillment: form.fulfillment,
        address: form.address,
        notes: form.notes,
        paymentMethod: form.paymentMethod,
      });
      if (!order) {
        setSubmitting(false);
        submittingRef.current = false;
        return;
      }
      router.push(`/confirmation/${order.ref}`);
    } catch {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center text-sm text-charcoal-300 sm:px-6 lg:px-8">
        Loading checkout…
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="section-title text-center">Checkout</h1>
        <div className="mt-8">
          <EmptyState
            emoji="🧾"
            title="You can't check out yet"
            message="Your cart is empty. Add a few meals before placing an order."
          >
            <Link href="/menu" className="btn btn-primary btn-md">
              Go to the menu
            </Link>
          </EmptyState>
        </div>
      </div>
    );
  }

  const isDelivery = form.fulfillment === "delivery";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <h1 className="section-title">Checkout</h1>
        <p className="section-sub">
          Enter your details and confirm your order. This demo does not process real
          payments.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="text-lg font-bold text-charcoal-900">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                required
                error={errors.name}
                className="sm:col-span-2"
              >
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  autoComplete="name"
                  placeholder="e.g. Ada Obi"
                />
              </Field>
              <Field label="Phone number" required error={errors.phone}>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="0801 234 5678"
                />
              </Field>
              <Field label="Email (optional)" error={errors.email}>
                <input
                  className="input"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                />
              </Field>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-lg font-bold text-charcoal-900">Fulfilment</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "delivery", label: "Delivery", hint: "We bring it to your address" },
                  { value: "pickup", label: "Pickup", hint: "Collect it from the restaurant" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer flex-col rounded-2xl border px-4 py-3 transition ${
                    form.fulfillment === option.value
                      ? "border-brand-400 bg-brand-50"
                      : "border-charcoal-900/10 hover:border-brand-200"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="fulfillment"
                      value={option.value}
                      checked={form.fulfillment === option.value}
                      onChange={() => {
                        update("fulfillment", option.value);
                        update(
                          "paymentMethod",
                          option.value === "pickup" ? "pay-on-delivery" : form.paymentMethod,
                        );
                      }}
                      className="h-4 w-4 accent-brand-500"
                    />
                    <span className="text-sm font-bold text-charcoal-900">{option.label}</span>
                  </span>
                  <span className="mt-1 pl-6 text-xs text-charcoal-300">{option.hint}</span>
                </label>
              ))}
            </div>

            {isDelivery && (
              <div className="mt-4">
                <Field label="Delivery address" required error={errors.address}>
                  <textarea
                    className="input resize-none"
                    rows={2}
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    autoComplete="street-address"
                    placeholder="Street, area, city, landmark"
                  />
                </Field>
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-lg font-bold text-charcoal-900">Payment</h2>
            <div className="mt-4 grid gap-3">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                  form.paymentMethod === "pay-on-delivery"
                    ? "border-brand-400 bg-brand-50"
                    : "border-charcoal-900/10 hover:border-brand-200"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === "pay-on-delivery"}
                  onChange={() => update("paymentMethod", "pay-on-delivery")}
                  className="mt-0.5 h-4 w-4 accent-brand-500"
                />
                <span>
                  <span className="block text-sm font-bold text-charcoal-900">
                    {isDelivery ? "Pay on delivery" : "Pay at pickup"}
                  </span>
                  <span className="block text-xs text-charcoal-300">
                    Pay with cash or transfer when you receive your order.
                  </span>
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                  form.paymentMethod === "demo-payment"
                    ? "border-brand-400 bg-brand-50"
                    : "border-charcoal-900/10 hover:border-brand-200"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === "demo-payment"}
                  onChange={() => update("paymentMethod", "demo-payment")}
                  className="mt-0.5 h-4 w-4 accent-brand-500"
                />
                <span>
                  <span className="block text-sm font-bold text-charcoal-900">
                    Pay online (demo)
                  </span>
                  <span className="block text-xs text-charcoal-300">
                    Simulated payment for the demo — no card details are collected and
                    no real charge is made.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="card p-5">
            <Field label="Order notes (optional)">
              <textarea
                className="input resize-none"
                rows={2}
                maxLength={300}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Anything the restaurant or rider should know?"
              />
            </Field>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="text-lg font-bold text-charcoal-900">Order summary</h2>
            <ul className="mt-4 space-y-3">
              {cart.map((line) => (
                <li key={line.lineId} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 text-charcoal-700">
                    <span className="font-semibold text-charcoal-900">
                      {line.quantity}× {line.name}
                    </span>
                    {line.selections.length > 0 && (
                      <span className="mt-0.5 block text-xs text-charcoal-300">
                        {line.selections
                          .map((s) => `${s.groupName}: ${s.choiceNames.join(", ")}`)
                          .join(" · ")}
                      </span>
                    )}
                  </span>
                  <span className="whitespace-nowrap font-semibold text-charcoal-900">
                    {formatNaira(lineTotal(line))}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-charcoal-900/5 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal-500">Subtotal</dt>
                <dd className="font-semibold text-charcoal-900">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-500">
                  {isDelivery ? "Delivery fee" : "Pickup"}
                </dt>
                <dd className="font-semibold text-charcoal-900">
                  {deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-charcoal-900/5 pt-4">
              <span className="text-base font-bold text-charcoal-900">Total</span>
              <span className="text-2xl font-black text-brand-600">{formatNaira(total)}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg mt-5 w-full"
            >
              {submitting ? "Placing order…" : "Place order"}
            </button>
            <p className="mt-3 flex items-start gap-2 text-xs text-charcoal-300">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-leaf-500" />
              Prices are recalculated from the menu before your order is saved.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`} data-error={error ? "true" : undefined}>
      <span className="label">
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
