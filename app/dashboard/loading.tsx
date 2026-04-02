import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 rounded-lg border border-stroke bg-bg-raised p-6 animate-enter">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-16 w-28 rounded-lg" />
            <Skeleton className="h-16 w-36 rounded-lg" />
          </div>
        </div>
        <div className="mt-6 flex gap-2 border-t border-stroke pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded" />
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-lg border border-stroke bg-bg-raised p-5">
        <div className="grid gap-3 lg:grid-cols-6">
          <Skeleton className="h-9 rounded lg:col-span-2" />
          <Skeleton className="h-9 rounded" />
          <Skeleton className="h-9 rounded" />
          <Skeleton className="h-9 rounded" />
        </div>
      </div>

      {/* Table rows */}
      <div className="rounded-lg border border-stroke bg-bg-raised">
        <div className="border-b border-stroke px-4 py-3 flex gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-6 border-b border-stroke/50 px-4 py-4 last:border-0">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </main>
  );
}
