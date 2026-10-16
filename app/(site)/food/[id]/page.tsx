import { Suspense } from "react";
import type { Metadata } from "next";
import { FoodDetails } from "@/components/food-details";
import { MEALS } from "@/lib/data/menu";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meal = MEALS.find((item) => item.id === id);
  if (!meal) return { title: "Meal details" };
  return {
    title: meal.name,
    description: meal.description,
  };
}

function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center text-sm text-charcoal-300 sm:px-6 lg:px-8">
      Loading meal…
    </div>
  );
}

async function FoodDetailsParams({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FoodDetails mealId={id} />;
}

export default function FoodDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <FoodDetailsParams params={params} />
    </Suspense>
  );
}
