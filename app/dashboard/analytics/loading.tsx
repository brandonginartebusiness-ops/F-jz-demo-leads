export default function AnalyticsLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 animate-pulse rounded-3xl bg-[#1a1a1a] p-6">
        <div className="h-4 w-40 rounded bg-[#2a2a2a]" />
        <div className="mt-3 h-8 w-80 rounded bg-[#2a2a2a]" />
        <div className="mt-6 flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-[#2a2a2a]" />
          ))}
        </div>
      </div>

      <div className="grid animate-pulse gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-3xl bg-[#1a1a1a] p-5">
            <div className="h-3 w-24 rounded bg-[#2a2a2a]" />
            <div className="mt-3 h-8 w-20 rounded bg-[#2a2a2a]" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid animate-pulse gap-6 xl:grid-cols-2">
        <div className="h-80 rounded-3xl bg-[#1a1a1a]" />
        <div className="h-80 rounded-3xl bg-[#1a1a1a]" />
      </div>
    </main>
  );
}
