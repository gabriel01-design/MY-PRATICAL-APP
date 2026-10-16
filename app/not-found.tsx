import Link from "next/link";
import { BrandMark } from "@/components/ui";
import { ArrowRightIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="animate-fade-up flex max-w-lg flex-col items-center">
        <BrandMark size="md" />
        <p className="mt-8 text-6xl font-black tracking-tight text-brand-500">404</p>
        <h1 className="mt-3 text-2xl font-bold text-charcoal-900 sm:text-3xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-500 sm:text-base">
          The page may have moved, or the link might be broken. Let&apos;s get you
          back to the food.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/menu" className="btn btn-primary btn-md">
            Browse the menu <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link href="/" className="btn btn-outline btn-md">
            Back home
          </Link>
        </div>

        <p className="mt-8 text-sm text-charcoal-300">
          Looking for a recent order?{" "}
          <Link href="/my-orders" className="font-semibold text-brand-600 hover:underline">
            Track it with your reference
          </Link>
        </p>
      </div>
    </div>
  );
}
