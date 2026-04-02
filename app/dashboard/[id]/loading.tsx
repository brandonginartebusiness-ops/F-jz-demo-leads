import { Skeleton } from "@/components/ui/skeleton";

export default function PermitDetailLoading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-4 w-32" />

      <div className="grid gap-6 animate-enter xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-stroke bg-bg-raised p-6 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-stroke bg-bg-raised p-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-3 h-5 w-40" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-stroke bg-bg-raised p-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="mt-2 h-4 w-52" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-40 w-full rounded" />
              <Skeleton className="h-10 w-36 rounded" />
            </div>
          </div>
          <div className="rounded-lg border border-stroke bg-bg-raised p-6">
            <Skeleton className="h-6 w-36" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
