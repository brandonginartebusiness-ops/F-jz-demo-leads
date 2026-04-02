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

function StatSkeleton() {
  return (
    <div className="panel-lg p-5">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton mt-4 h-8 w-20 rounded" />
    </div>
  );
}

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
      <div className="space-y-6 animate-fade-in">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </section>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="panel-lg p-6">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton mt-4 h-80 w-full rounded-xl" />
          </div>
          <div className="panel-lg p-6">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton mt-4 h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <section className="panel-lg p-6">
        <h2 className="text-lg font-semibold text-white">Analytics unavailable</h2>
        <p className="mt-2 text-sm text-muted">{state.error}</p>
      </section>
    );
  }

  const analytics = state.data;

  return (
    <div className="animate-fade-in">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total permits", value: analytics.topStats.totalPermits.toLocaleString() },
          { label: "Pipeline value", value: formatCurrency(analytics.topStats.pipelineValue) },
          { label: "New this week", value: analytics.topStats.newThisWeek.toLocaleString() },
          { label: "Leads contacted", value: analytics.topStats.leadsContacted.toLocaleString() },
          { label: "Actions this week", value: analytics.topStats.activityThisWeek.toLocaleString() },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="panel-lg p-5 animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <p className="section-label">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="mt-6">
        <AnalyticsCharts
          leadStatusBreakdown={analytics.leadStatusBreakdown}
          permitsOverTime={analytics.permitsOverTime}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Priority Breakdown</h2>
            <p className="mt-1 text-sm text-muted">
              Lead priority derived from estimated value tiers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {analytics.priorityBreakdown.map((priority) => (
              <div
                key={priority.name}
                className="inline-flex items-center gap-3 rounded-2xl border border-border bg-panel-soft px-4 py-3"
              >
                <span className="text-sm font-medium text-silver">{priority.name}</span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-white">
                  {priority.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Top Contractors</h2>
            <p className="mt-1 text-sm text-muted">
              Top 10 contractors ranked by permit count, with total pipeline value.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="text-left section-label">
                <tr>
                  <th className="px-0 py-3">Contractor</th>
                  <th className="px-0 py-3">Permits</th>
                  <th className="px-0 py-3 text-right">Total value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.topContractors.map((contractor) => (
                  <tr key={contractor.name}>
                    <td className="px-0 py-4 text-white">{contractor.name}</td>
                    <td className="px-0 py-4 text-silver">
                      {contractor.permitCount.toLocaleString()}
                    </td>
                    <td className="px-0 py-4 text-right text-silver">
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
        <section className="panel-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Most Active Areas</h2>
            <p className="mt-1 text-sm text-muted">
              Top 10 street-area groups based on the first word in each address.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="text-left section-label">
                <tr>
                  <th className="px-0 py-3">Area</th>
                  <th className="px-0 py-3 text-right">Permit count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.activeNeighborhoods.map((area) => (
                  <tr key={area.area}>
                    <td className="px-0 py-4 text-white">{area.area}</td>
                    <td className="px-0 py-4 text-right text-silver">
                      {area.permitCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
