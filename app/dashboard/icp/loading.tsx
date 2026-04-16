export default function IcpLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 animate-pulse card p-6">
        <div className="h-4 w-36 skel rounded" />
        <div className="mt-3 h-8 w-48 skel rounded" />
        <div className="mt-6 flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 skel rounded" />
          ))}
        </div>
      </div>

      <div className="grid animate-pulse gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-6">
            <div className="h-5 w-40 skel rounded" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full skel rounded" />
              <div className="h-3 w-3/4 skel rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
