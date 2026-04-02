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
    <div className="card-accent p-5">
      <div className="skel h-3 w-20 rounded" />
      <div className="skel mt-4 h-9 w-24 rounded" />
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
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Failed to load analytics.");
        }

        const data = (await response.json()) as AnalyticsData;
        if (!cancelled) setState({ status: "ready", data, error: null });
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
    return () => { cancelled = true; };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="space-y-6 animate-enter">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)}
        </section>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="card p-6"><div className="skel h-4 w-32 rounded" /><div className="skel mt-4 h-96 w-full rounded-lg" /></div>
          <div className="card p-6"><div className="skel h-4 w-32 rounded" /><div className="skel mt-4 h-96 w-full rounded-lg" /></div>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <section className="card p-6">
        <h2 className="font-display text-xl text-sand-bright">ANALYTICS UNAVAILABLE</h2>
        <p className="mt-2 text-sm text-sand">{state.error}</p>
      </section>
    );
  }

  const a = state.data;
  const stats = [
    { label: "Total Permits", value: a.topStats.totalPermits.toLocaleString() },
    { label: "Pipeline Value", value: formatCurrency(a.topStats.pipelineValue) },
    { label: "New This Week", value: a.topStats.newThisWeek.toLocaleString() },
    { label: "Contacted", value: a.topStats.leadsContacted.toLocaleString() },
    { label: "Actions / Wk", value: a.topStats.activityThisWeek.toLocaleString() },
  ];

  return (
    <div className="animate-enter">
      {/* Stat cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="card-accent p-5 animate-enter-scale"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <p className="label-stencil">{stat.label}</p>
            <p className="mt-2 stat-value">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Charts */}
      <div className="mt-6">
        <AnalyticsCharts
          leadStatusBreakdown={a.leadStatusBreakdown}
          permitsOverTime={a.permitsOverTime}
        />
      </div>

      {/* Priority + Contractors */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="card p-6">
          <h2 className="font-display text-xl text-sand-bright">PRIORITY BREAKDOWN</h2>
          <p className="mt-1 text-sm text-sand">Lead priority by estimated value tier.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {a.priorityBreakdown.map((p) => (
              <div key={p.name} className="inline-flex items-center gap-2 rounded-lg border border-stroke bg-bg-soft px-4 py-2.5">
                <span className="text-sm font-medium text-sand">{p.name}</span>
                <span className="rounded border border-accent/20 bg-accent/10 px-2.5 py-0.5 font-display text-lg text-sand-bright">
                  {p.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl text-sand-bright">TOP CONTRACTORS</h2>
          <p className="mt-1 text-sm text-sand">Top 10 by permit count + pipeline value.</p>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-stroke text-left">
                <tr className="label-stencil">
                  <th className="pb-3 pr-4">Contractor</th>
                  <th className="pb-3 pr-4">Permits</th>
                  <th className="pb-3 text-right">Total value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {a.topContractors.map((c) => (
                  <tr key={c.name}>
                    <td className="py-3 pr-4 text-sand-bright">{c.name}</td>
                    <td className="py-3 pr-4 font-mono text-sand">{c.permitCount.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono text-sand">{formatCurrency(c.totalEstimatedValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Active areas */}
      <div className="mt-6">
        <section className="card p-6">
          <h2 className="font-display text-xl text-sand-bright">MOST ACTIVE AREAS</h2>
          <p className="mt-1 text-sm text-sand">Top 10 street-area groups by first address word.</p>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-stroke text-left">
                <tr className="label-stencil">
                  <th className="pb-3 pr-4">Area</th>
                  <th className="pb-3 text-right">Permit count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {a.activeNeighborhoods.map((n) => (
                  <tr key={n.area}>
                    <td className="py-3 pr-4 text-sand-bright">{n.area}</td>
                    <td className="py-3 text-right font-mono text-sand">{n.permitCount.toLocaleString()}</td>
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
