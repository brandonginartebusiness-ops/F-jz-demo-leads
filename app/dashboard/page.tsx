import { DashboardFilters } from "@/components/dashboard/filters";
import { PermitsCards } from "@/components/dashboard/permits-cards";
import { PermitsTable } from "@/components/dashboard/permits-table";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { listPermits, type DashboardSearchParams } from "@/lib/permits/queries";

type Props = {
  searchParams: DashboardSearchParams;
};

export default async function DashboardPage({ searchParams }: Props) {
  const permits = await listPermits(searchParams);
  const totalValue = permits.reduce(
    (sum, permit) => sum + (permit.estimated_value ?? 0),
    0,
  );

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#f2df9e]">
            Internal dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Miami-Dade demolition permits
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/65">
            Review synced commercial demolition permits, prioritize high-value jobs,
            and move each lead through your outreach pipeline.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#11111d] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Records</p>
            <p className="mt-1 text-xl font-semibold text-white">{permits.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#11111d] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Pipeline value</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(totalValue)}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>

      <div className="space-y-6">
        <DashboardFilters searchParams={searchParams} />

        {permits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center text-white/60">
            No permits match the current filters yet.
          </div>
        ) : searchParams.view === "cards" ? (
          <PermitsCards permits={permits} />
        ) : (
          <PermitsTable permits={permits} />
        )}
      </div>
    </main>
  );
}
