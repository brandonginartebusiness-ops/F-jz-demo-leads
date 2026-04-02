import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardNav } from "@/components/dashboard/nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getLatestCompanyContext } from "@/lib/company-context/queries";
import { listTopGcs, listPropertyOwners, listMostActiveProperties } from "@/lib/agents/queries";
import { createClient } from "@/lib/supabase/server";

function formatCurrency(val: number | null) {
  if (!val) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
}

export default async function IntelligencePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/intelligence");

  const companyContext = await getLatestCompanyContext();
  const [topGcs, developers, activeProperties] = await Promise.all([
    listTopGcs(15),
    listPropertyOwners(15),
    listMostActiveProperties(15),
  ]);

  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="hazard-top mb-8 card p-6 animate-enter">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label-stencil text-accent">Multi-Agent Analysis</p>
            <h1 className="mt-2 font-display text-4xl text-sand-bright lg:text-5xl">
              LEAD INTELLIGENCE
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand">
              Aggregated intelligence from the permit enrichment, GC profiling,
              close probability, and developer lookup agents.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="card-accent px-5 py-3">
              <p className="label-stencil">GC Profiles</p>
              <p className="mt-1 stat-value-sm">{topGcs.length}</p>
            </div>
            <div className="card-accent px-5 py-3">
              <p className="label-stencil">Developers</p>
              <p className="mt-1 stat-value-sm">{developers.length}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
        <div className="mt-6 border-t border-stroke pt-4">
          <DashboardNav currentPath="/dashboard/intelligence" showSetupWarning={!companyContext} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top GCs to Target */}
        <section className="card p-6 animate-enter delay-1">
          <h2 className="font-display text-xl text-sand-bright">TOP GCS TO TARGET</h2>
          <p className="mt-1 text-sm text-sand">Ranked by active permits in last 90 days.</p>

          {topGcs.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-stroke p-8 text-center">
              <p className="font-display text-lg text-sand/40">NO DATA YET</p>
              <p className="mt-1 text-xs text-sand/30">Run the intelligence pipeline to populate GC profiles.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {topGcs.map((gc, i) => (
                <div key={gc.id} className="flex items-center gap-3 rounded-lg border border-stroke bg-bg-soft p-3 transition-colors hover:border-sand/20">
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-accent/10 font-display text-sm text-accent">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sand-bright">{gc.contractor_name}</p>
                    <p className="text-xs text-sand">
                      {gc.active_permits_90d} active &middot; {gc.total_permits_12mo} total &middot; {gc.demo_frequency} demo
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-sand-bright">{formatCurrency(gc.avg_project_value)}</p>
                    <p className="font-mono text-[10px] text-sand/50">avg value</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Developer Watch List */}
        <section className="card p-6 animate-enter delay-2">
          <h2 className="font-display text-xl text-sand-bright">DEVELOPER WATCH LIST</h2>
          <p className="mt-1 text-sm text-sand">Corporate owners with 2+ permits.</p>

          {developers.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-stroke p-8 text-center">
              <p className="font-display text-lg text-sand/40">NO DATA YET</p>
              <p className="mt-1 text-xs text-sand/30">Run the intelligence pipeline to populate owner data.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {developers.map((owner) => (
                <div key={owner.id} className="rounded-lg border border-stroke bg-bg-soft p-3 transition-colors hover:border-sand/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sand-bright">{owner.owner_name || "Unknown"}</p>
                      <p className="text-xs text-sand">
                        <span className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-accent">
                          {owner.owner_type}
                        </span>
                        {" "}&middot; Folio {owner.folio}
                      </p>
                    </div>
                    {owner.mailing_address ? (
                      <p className="shrink-0 text-xs text-sand/50">{owner.mailing_address}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Most Active Properties */}
        <section className="card p-6 animate-enter delay-3 lg:col-span-2">
          <h2 className="font-display text-xl text-sand-bright">MOST ACTIVE PROPERTIES</h2>
          <p className="mt-1 text-sm text-sand">Properties with the highest trade count — signals major development activity.</p>

          {activeProperties.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-stroke p-8 text-center">
              <p className="font-display text-lg text-sand/40">NO DATA YET</p>
              <p className="mt-1 text-xs text-sand/30">Run the intelligence pipeline to discover permit ecosystems.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeProperties.map((item) => (
                <Link
                  key={item.permitId}
                  className="rounded-lg border border-stroke bg-bg-soft p-4 transition-all duration-200 hover:border-sand/20 hover:bg-bg-hover/30"
                  href={`/dashboard/${item.permitId}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-medium text-sand-bright">
                      {(item.permit as { property_address?: string })?.property_address || "Unknown"}
                    </p>
                    <span className="shrink-0 rounded bg-accent/15 px-2 py-0.5 font-mono text-xs font-semibold text-accent">
                      {item.relatedCount} trades
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-sand/50">
                    {(item.permit as { owner_name?: string })?.owner_name || "—"}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-mono text-sm text-sand">
                      {formatCurrency((item.permit as { estimated_value?: number })?.estimated_value ?? null)}
                    </span>
                    {(() => {
                      const p = item.permit as { close_probability_score?: number; close_probability_label?: string } | null;
                      if (!p?.close_probability_score) return null;
                      const color = p.close_probability_label === "Hot" ? "text-accent" : p.close_probability_label === "Warm" ? "text-amber" : "text-sand";
                      return <span className={`font-mono text-xs ${color}`}>{p.close_probability_label}</span>;
                    })()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
