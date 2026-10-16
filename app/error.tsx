"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BrandMark } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the console so it is not silently swallowed.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="animate-fade-up flex max-w-lg flex-col items-center">
        <BrandMark size="md" />
        <p className="mt-8 text-5xl font-black tracking-tight text-brand-500">Oops</p>
        <h1 className="mt-3 text-2xl font-bold text-charcoal-900 sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-500 sm:text-base">
          An unexpected error stopped this page from loading. Your cart and any
          saved orders are still safe.
        </p>
        {error.digest && (
          <p className="mt-3 rounded-full bg-cream-100 px-3 py-1 font-mono text-xs text-charcoal-300">
            Ref: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary btn-md">
            Try again
          </button>
          <Link href="/" className="btn btn-outline btn-md">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
