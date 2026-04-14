import { DashboardFilters } from "@/components/dashboard/filters";
import { DashboardNav } from "@/components/dashboard/nav";
import { PermitsCards } from "@/components/dashboard/permits-cards";
import { PermitsTable } from "@/components/dashboard/permits-table";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getLatestCompanyContext } from "@/lib/company-context/queries";
import {
  getEffectiveDashboardSearchParams,
  listPermits,
  type DashboardSearchParams,
} from "@/lib/permits/queries";

type Props = {
  searchParams: DashboardSearchParams;
};

export default async function DashboardPage({ searchParams }: Props) {
  const effectiveSearchParams = getEffectiveDashboardSearchParams(searchParams);
  const [permits, companyContext] = await Promise.all([
    listPermits(searchParams),
    getLatestCompanyContext(),
  ]);
  const totalValue = permits.reduce(
    (sum, permit) =>
      sum + ((permit.estimated_value ?? 0) > 1 ? (permit.estimated_value ?? 0) : 0),
    0,
  );

  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-5 card p-5 animate-enter">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label-stencil text-accent">Internal Dashboard</p>
            <h1 className="mt-2 text-[28px] font-semibold text-sand-bright">
              Miami-Dade demolition leads
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand">
              Review official demolition permits plus hidden demo-related commercial
              jobs, prioritize the strongest opportunities, and move each lead through
              your outreach pipeline.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="card-accent px-5 py-3">
              <p className="label-stencil">Records</p>
              <p className="mt-1 stat-value-sm">{permits.length}</p>
            </div>
            <div className="card-accent px-5 py-3">
              <p className="label-stencil">Pipeline</p>
              <p className="mt-1 stat-value-sm font-mono">
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

        <div className="mt-6 border-t border-stroke pt-4">
          <DashboardNav currentPath="/dashboard" showSetupWarning={!companyContext} />
        </div>
      </header>

      {/* Content */}
      <div className="space-y-4">
        <DashboardFilters searchParams={effectiveSearchParams} />

        {permits.length === 0 ? (
          <div className="card border-dashed p-12 text-center">
            <p className="font-display text-2xl text-sand/50">NO PERMITS MATCH</p>
            <p className="mt-2 text-sm text-sand/40">
              Try adjusting your filters or resetting to see all leads.
            </p>
          </div>
        ) : effectiveSearchParams.view === "cards" ? (
          <PermitsCards permits={permits} />
        ) : (
          <PermitsTable permits={permits} initialSort={effectiveSearchParams.sort} />
        )}
      </div>
    </main>
  );
}
