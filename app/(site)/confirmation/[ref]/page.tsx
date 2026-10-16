import { Suspense } from "react";
import type { Metadata } from "next";
import { ConfirmationView } from "@/components/confirmation-view";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your order has been received and is with the kitchen.",
};

function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center text-sm text-charcoal-300 sm:px-6 lg:px-8">
      Loading your order…
    </div>
  );
}

async function ConfirmationParams({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return <ConfirmationView orderRef={decodeURIComponent(ref)} />;
}

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ConfirmationParams params={params} />
    </Suspense>
  );
}
