"use client";

import Image from "next/image";
import Link from "next/link";
import { MealCard } from "@/components/meal-card";
import { StarRating } from "@/components/ui";
import { ArrowRightIcon, ClockIcon, FireIcon, LocationIcon, PhoneIcon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { TESTIMONIALS } from "@/lib/data/menu";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=75";

export default function HomePage() {
  const { meals, categories, settings, hydrated } = useStore();

  const featured = meals.filter((meal) => meal.featured).slice(0, 3);
  const bestSellers = meals.filter((meal) => meal.popular).slice(0, 4);
  const categoryById = (id: string) => categories.find((c) => c.id === id);

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-cream-50">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
          <div>
            <span className="badge bg-white text-brand-600 shadow-sm">
              <FireIcon className="h-3.5 w-3.5" /> Fresh from the kitchen
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-charcoal-900 sm:text-5xl lg:text-6xl">
              Delicious Food,
              <br />
              <span className="text-brand-500">Delivered to Your Door.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-charcoal-500 sm:text-lg">
              Skip the queue. Order your favourite Nigerian meals, customise every
              detail and track your food from kitchen to doorstep — all in a few taps.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/menu" className="btn btn-primary btn-lg">
                Order Now <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link href="/my-orders" className="btn btn-outline btn-lg">
                Track an order
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                { label: "Avg. delivery", value: "35 min" },
                { label: "Menu items", value: `${meals.length}+` },
                { label: "Happy customers", value: "12k+" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/70 px-3 py-3 text-center">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-charcoal-300">
                    {stat.label}
                  </dt>
                  <dd className="mt-0.5 text-lg font-extrabold text-charcoal-900">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-500/20">
              <Image
                src={HERO_IMAGE}
                alt="A table full of freshly prepared meals"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl sm:left-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf-100 text-leaf-500">
                <ClockIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-charcoal-300">Open today</p>
                <p className="text-sm font-bold text-charcoal-900">Kitchen is taking orders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured meals */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Featured meals</h2>
            <p className="section-sub">
              Chef&apos;s picks that our customers keep coming back for.
            </p>
          </div>
          <Link href="/menu" className="btn btn-ghost btn-sm">
            View full menu <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!hydrated
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : featured.map((meal, i) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  category={categoryById(meal.categoryId)}
                  priority={i === 0}
                />
              ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="section-title">Popular food categories</h2>
            <p className="section-sub mx-auto">
              From smoky party rice to wood-fired pizza — browse by what you&apos;re craving.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => {
              const count = meals.filter((m) => m.categoryId === category.id).length;
              return (
                <Link
                  key={category.id}
                  href={`/menu?category=${category.id}`}
                  className="card card-hover flex items-center gap-4 p-4"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
                    {category.emoji}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-charcoal-900">
                      {category.name}
                    </span>
                    <span className="block text-xs text-charcoal-300">
                      {count} item{count === 1 ? "" : "s"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Promotional banner */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-charcoal-900 px-6 py-10 text-cream-100 sm:px-12 sm:py-14">
          <div className="relative z-10 max-w-xl">
            <span className="badge bg-brand-500 text-white">Free delivery</span>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              Spend ₦15,000 and delivery is on us.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-100/70 sm:text-base">
              Stock up on family-size portions of jollof, grilled chicken and
              drinks. Delivery is automatically free on qualifying orders.
            </p>
            <Link href="/menu" className="btn btn-primary btn-lg mt-6">
              Start an order <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-24 h-48 w-48 rounded-full bg-brand-300/20 blur-3xl" />
        </div>
      </section>

      {/* Best sellers */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Best-selling meals</h2>
            <p className="section-sub">The dishes ordered most often this month.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((meal) => (
            <MealCard key={meal.id} meal={meal} category={categoryById(meal.categoryId)} />
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-white py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="section-title">What our customers say</h2>
            <p className="section-sub mx-auto">
              Sample reviews from the demo dataset, shown to illustrate the layout.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((review) => (
              <figure key={review.name} className="card flex h-full flex-col p-5">
                <StarRating rating={review.rating} />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-charcoal-700">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 border-t border-charcoal-900/5 pt-3">
                  <p className="text-sm font-bold text-charcoal-900">{review.name}</p>
                  <p className="text-xs text-charcoal-300">{review.location}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="card grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
          {[
            { icon: <LocationIcon className="h-5 w-5" />, label: "Visit us", value: settings.address },
            { icon: <PhoneIcon className="h-5 w-5" />, label: "Call to order", value: settings.phone },
            { icon: <ClockIcon className="h-5 w-5" />, label: "Opening hours", value: settings.openingHours },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                {item.icon}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-300">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-charcoal-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-cream-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-cream-200" />
        <div className="h-3 w-full animate-pulse rounded bg-cream-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-cream-200" />
      </div>
    </div>
  );
}
