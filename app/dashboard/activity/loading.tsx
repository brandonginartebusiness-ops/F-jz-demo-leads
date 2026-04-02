export default function ActivityLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 animate-pulse rounded-3xl bg-[#1a1a1a] p-6">
        <div className="h-4 w-28 rounded bg-[#2a2a2a]" />
        <div className="mt-3 h-8 w-56 rounded bg-[#2a2a2a]" />
        <div className="mt-6 flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-[#2a2a2a]" />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-28 animate-pulse rounded-xl bg-[#1a1a1a]" />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-[#1a1a1a] p-5">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-[#2a2a2a]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-64 rounded bg-[#2a2a2a]" />
                <div className="h-3 w-40 rounded bg-[#2a2a2a]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
