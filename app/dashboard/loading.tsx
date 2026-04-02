import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-8 rounded-3xl bg-panel p-6 animate-fade-in">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-8 w-72 rounded" />
            <Skeleton className="h-4 w-96 rounded" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-16 w-28 rounded-2xl" />
            <Skeleton className="h-16 w-36 rounded-2xl" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="mb-6 rounded-2xl border border-border bg-panel p-5">
        <div className="grid gap-4 lg:grid-cols-6">
          <Skeleton className="h-10 rounded-lg lg:col-span-2" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-border bg-panel">
        <div className="p-4">
          <div className="flex gap-4 border-b border-border pb-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-20 rounded" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 border-b border-border/50 py-4 last:border-0"
            >
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
