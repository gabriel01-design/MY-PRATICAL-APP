export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-6">
      <div className="flex flex-col items-center gap-3 text-charcoal-300">
        <span
          aria-hidden
          className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500"
        />
        <p className="text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}
