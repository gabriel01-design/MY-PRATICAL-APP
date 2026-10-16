import { Suspense } from "react";
import type { Metadata } from "next";
import { TrackingView } from "@/components/tracking-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  const orderRef = decodeURIComponent(ref);
  return {
    title: `Tracking ${orderRef}`,
    description: "Follow your order from the kitchen to your door.",
  };
}

function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center text-sm text-charcoal-300 sm:px-6 lg:px-8">
      Loading order status…
    </div>
  );
}

async function TrackingParams({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return <TrackingView orderRef={decodeURIComponent(ref)} />;
}

export default function TrackingPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <TrackingParams params={params} />
    </Suspense>
  );
}
