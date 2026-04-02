export default function DashboardLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 animate-pulse rounded-3xl bg-[#1a1a1a] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="h-3 w-32 rounded bg-[#2a2a2a]" />
            <div className="h-8 w-72 rounded bg-[#2a2a2a]" />
            <div className="h-4 w-96 rounded bg-[#2a2a2a]" />
          </div>
          <div className="flex gap-4">
            <div className="h-16 w-28 rounded-2xl bg-[#2a2a2a]" />
            <div className="h-16 w-28 rounded-2xl bg-[#2a2a2a]" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-[#2a2a2a]" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-[#1a1a1a] p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-[#2a2a2a]" />
                <div className="h-3 w-64 rounded bg-[#2a2a2a]" />
              </div>
              <div className="h-6 w-16 rounded-full bg-[#2a2a2a]" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
