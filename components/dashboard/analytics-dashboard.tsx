"use client";

import { useEffect, useState } from "react";

import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { type AnalyticsData } from "@/lib/analytics/queries";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

type AnalyticsState =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: AnalyticsData; error: null }
  | { status: "error"; data: null; error: string };

export function AnalyticsDashboard() {
  const [state, setState] = useState<AnalyticsState>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        const response = await fetch("/api/analytics", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error ?? "Failed to load analytics.");
        }

        const data = (await response.json()) as AnalyticsData;

        if (!cancelled) {
          setState({ status: "ready", data, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            data: null,
            error: error instanceof Error ? error.message : "Failed to load analytics.",
          });
        }
      }
    }

    void loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6 text-sm text-[#888888]">
        Loading analytics...
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
        <h2 className="text-lg font-semibold text-white">Analytics unavailable</h2>
        <p className="mt-2 text-sm text-[#888888]">{state.error}</p>
      </section>
    );
  }

  const analytics = state.data;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
        <div className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">Actions this week</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {analytics.topStats.activityThisWeek.toLocaleString()}
          </p>
        </div>
      </section>

      <div className="mt-6">
        <AnalyticsCharts
          leadStatusBreakdown={analytics.leadStatusBreakdown}
          permitsOverTime={analytics.permitsOverTime}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Priority Breakdown</h2>
            <p className="mt-1 text-sm text-[#888888]">
              Lead priority derived from estimated value tiers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {analytics.priorityBreakdown.map((priority) => (
              <div
                key={priority.name}
                className="inline-flex items-center gap-3 rounded-2xl border border-[#FF6B00]/25 bg-[#202020] px-4 py-3"
              >
                <span className="text-sm font-medium text-[#C0C0C0]">{priority.name}</span>
                <span className="rounded-full bg-[#FF6B00]/10 px-3 py-1 text-sm font-semibold text-white">
                  {priority.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Top Contractors</h2>
            <p className="mt-1 text-sm text-[#888888]">
              Top 10 contractors ranked by permit count, with total pipeline value.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#FF6B00]/25 text-sm">
              <thead className="text-left text-xs uppercase tracking-[0.2em] text-[#888888]">
                <tr>
                  <th className="px-0 py-3">Contractor</th>
                  <th className="px-0 py-3">Permits</th>
                  <th className="px-0 py-3 text-right">Total value</th>
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
      </div>

      <div className="mt-6">
        <section className="rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Most Active Areas</h2>
            <p className="mt-1 text-sm text-[#888888]">
              Top 10 street-area groups based on the first word in each address.
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
    </>
  );
}
