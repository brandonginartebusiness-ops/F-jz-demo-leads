import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { DashboardNav } from "@/components/dashboard/nav";
import { getAnalyticsData } from "@/lib/analytics/queries";
import { getLatestCompanyContext } from "@/lib/company-context/queries";
import { createClient } from "@/lib/supabase/server";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AnalyticsPage() {
  const supabase = createClient();
  const companyContext = await getLatestCompanyContext();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/analytics");
  }

  const analytics = await getAnalyticsData();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 rounded-3xl bg-[#1a1a1a] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#C0C0C0]">
              Performance analytics
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Demolition pipeline analytics
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[#888888]">
              Track permit volume, contractor activity, lead progression, and area
              trends from the live permits dataset.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">
                Analytics
              </p>
              <p className="mt-1 text-xl font-semibold text-white">Live</p>
            </div>
            <SignOutButton />
          </div>
        </div>
        <DashboardNav
          currentPath="/dashboard/analytics"
          showSetupWarning={!companyContext}
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">Total permits</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {analytics.topStats.totalPermits.toLocaleString()}
          </p>
        </div>
        <div className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">Pipeline value</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {formatCurrency(analytics.topStats.pipelineValue)}
          </p>
        </div>
        <div className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">New this week</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {analytics.topStats.newThisWeek.toLocaleString()}
          </p>
        </div>
        <div className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">Leads contacted</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {analytics.topStats.leadsContacted.toLocaleString()}
          </p>
        </div>
      </section>

      <div className="mt-6">
        <AnalyticsCharts
          leadStatusBreakdown={analytics.leadStatusBreakdown}
          permitsOverTime={analytics.permitsOverTime}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Top Contractors</h2>
            <p className="mt-1 text-sm text-[#888888]">
              Most frequent contractor names by permit volume and total value.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#FF6B00]/25 text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.2em] text-[#888888]">
                <tr>
                  <th className="px-0 py-3">Contractor</th>
                  <th className="px-0 py-3">Permits</th>
                  <th className="px-0 py-3 text-right">Estimated value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FF6B00]/25">
                {analytics.topContractors.map((contractor) => (
                  <tr key={contractor.name}>
                    <td className="px-0 py-4 text-white">{contractor.name}</td>
                    <td className="px-0 py-4 text-[#C0C0C0]">
                      {contractor.permitCount.toLocaleString()}
                    </td>
                    <td className="px-0 py-4 text-right text-[#C0C0C0]">
                      {formatCurrency(contractor.totalEstimatedValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Permit Status Breakdown</h2>
            <p className="mt-1 text-sm text-[#888888]">
              Current `bp_status` counts across the tracked permit set.
            </p>
          </div>
          <div className="grid gap-3">
            {analytics.permitStatusBreakdown.map((status) => (
              <div
                key={status.name}
                className="flex items-center justify-between rounded-2xl border border-[#FF6B00]/25 bg-[#202020] px-4 py-3"
              >
                <span className="text-sm font-medium text-[#C0C0C0]">{status.name}</span>
                <span className="rounded-full bg-[#FF6B00]/10 px-3 py-1 text-sm font-medium text-white">
                  {status.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6">
        <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Most Active Neighborhoods</h2>
            <p className="mt-1 text-sm text-[#888888]">
              Grouped by ZIP when present, otherwise by city or street pattern.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#FF6B00]/25 text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.2em] text-[#888888]">
                <tr>
                  <th className="px-0 py-3">Area</th>
                  <th className="px-0 py-3 text-right">Permit count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FF6B00]/25">
                {analytics.activeNeighborhoods.map((area) => (
                  <tr key={area.area}>
                    <td className="px-0 py-4 text-white">{area.area}</td>
                    <td className="px-0 py-4 text-right text-[#C0C0C0]">
                      {area.permitCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
