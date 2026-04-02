import { Skeleton } from "@/components/ui/skeleton";

export default function PermitDetailLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-32 rounded" />

      <div className="grid gap-6 animate-fade-in xl:grid-cols-[1.25fr_0.75fr]">
        {/* Main content skeleton */}
        <div className="space-y-6 rounded-3xl border border-border bg-panel p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-8 w-80 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Property section */}
          <div className="space-y-4">
            <Skeleton className="h-3 w-20 rounded" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-panel p-4">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="mt-3 h-5 w-40 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Permit section */}
          <div className="space-y-4">
            <Skeleton className="h-3 w-16 rounded" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-panel p-4">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="mt-3 h-5 w-36 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-panel p-6">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="mt-2 h-4 w-56 rounded" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-panel p-6">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="mt-2 h-4 w-48 rounded" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
