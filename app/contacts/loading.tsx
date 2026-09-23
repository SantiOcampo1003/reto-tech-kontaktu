export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="h-6 w-32 animate-pulse rounded bg-border" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-surface" />
        ))}
      </div>
    </main>
  );
}
