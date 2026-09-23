export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="h-4 w-24 animate-pulse rounded bg-border" />
      <div className="mt-6 h-28 animate-pulse rounded-lg border border-border bg-surface" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="h-32 animate-pulse rounded-lg border border-border bg-surface" />
          <div className="h-52 animate-pulse rounded-lg border border-border bg-surface" />
          <div className="h-52 animate-pulse rounded-lg border border-border bg-surface" />
        </div>
        <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
      </div>
    </main>
  );
}
