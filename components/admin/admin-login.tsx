"use client";

import { useState } from "react";
import { LockIcon } from "@/components/icons";
import { BrandMark } from "@/components/ui";
import { useStore } from "@/lib/store";

export function AdminLogin() {
  const { login, settings } = useStore();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim()) {
      setError("Please enter the access code.");
      return;
    }
    setBusy(true);
    try {
      const ok = await login(code);
      if (!ok) {
        setError("That access code is not correct.");
        return;
      }
      setError(null);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Could not verify the access code. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark />
          <h1 className="mt-4 text-2xl font-black text-white">
            {settings.restaurantName} · Staff
          </h1>
          <p className="mt-1 text-sm text-cream-100/60">
            Enter the special code to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6" noValidate>
          <label className="block">
            <span className="label">Special access code</span>
            <span className="relative block">
              <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-300" />
              <input
                className="input pl-10 font-mono tracking-wider"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="Enter access code"
              />
            </span>
          </label>

          {error && <p className="field-error mt-3">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary btn-lg mt-5 w-full disabled:opacity-60"
          >
            {busy ? "Checking…" : "Unlock dashboard"}
          </button>

          <p className="mt-4 text-center text-xs leading-relaxed text-cream-100/50">
            Access is limited to restaurant staff. The code is managed by the
            owner.
          </p>
        </form>
      </div>
    </div>
  );
}
