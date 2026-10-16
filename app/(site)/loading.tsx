export default function SiteLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <div className="h-8 w-56 animate-pulse rounded-2xl bg-cream-200" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-full bg-cream-200" />
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-[4/3] animate-pulse bg-cream-200" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-cream-200" />
              <div className="h-3 w-full animate-pulse rounded bg-cream-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-cream-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
