export default function ActivityLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 animate-pulse card p-6">
        <div className="h-4 w-28 skel rounded" />
        <div className="mt-3 h-8 w-56 skel rounded" />
        <div className="mt-6 flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 skel rounded" />
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-28 skel rounded" />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse card p-5">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 skel rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-64 skel rounded" />
                <div className="h-3 w-40 skel rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
