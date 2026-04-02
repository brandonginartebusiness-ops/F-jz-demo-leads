import Link from "next/link";
import { notFound } from "next/navigation";

import { ActivityFeedList } from "@/components/dashboard/activity-feed-list";
import { LeadTypeBadge } from "@/components/dashboard/lead-type-badge";
import { PriorityBadge } from "@/components/dashboard/priority-badge";
import { LeadDetailForm } from "@/components/dashboard/lead-detail-form";
import { listPermitActivity } from "@/lib/activity-feed/queries";
import { getPermitEcosystem, getGcProfile, getPropertyOwner } from "@/lib/agents/queries";
import { getPermitById } from "@/lib/permits/queries";
import { formatEstimatedValue } from "@/lib/permits/value";

type Props = {
  params: { id: string };
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
}

function formatDateOnly(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(value));
}

function buildPropertyAppraiserUrl(folioNumber: string | null) {
  if (!folioNumber) return null;
  return `https://www.miamidade.gov/Apps/PA/propertysearch/#/?folioNumber=${encodeURIComponent(folioNumber)}`;
}

function buildMapsEmbedUrl(address: string | null, city: string | null, state: string | null) {
  const query = [address, city, state].filter(Boolean).join(", ");
  if (!query) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function renderValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`card p-4 ${wide ? "sm:col-span-2" : ""}`}>
      <dt className="label-stencil">{label}</dt>
      <dd className="mt-2 text-sm text-sand-bright">{children}</dd>
    </div>
  );
}

export default async function PermitDetailPage({ params }: Props) {
  try {
    const permit = await getPermitById(params.id);
    const [recentActivity, ecosystem, gcProfile, propertyOwner] = await Promise.all([
      listPermitActivity(params.id, 5),
      getPermitEcosystem(params.id),
      permit.contractor_name ? getGcProfile(permit.contractor_name) : null,
      permit.folio_number ? getPropertyOwner(permit.folio_number) : null,
    ]);
    const propertyAppraiserUrl = buildPropertyAppraiserUrl(permit.folio_number);
    const mapsEmbedUrl = buildMapsEmbedUrl(permit.property_address, permit.city, permit.state);
    const closeFactors = permit.close_factors as {
      activity_score?: number; activity_reason?: string;
      gc_score?: number; gc_reason?: string;
      value_score?: number; value_reason?: string;
      owner_score?: number; owner_reason?: string;
      total?: number;
    } | null;

    return (
      <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link className="text-sm text-sand transition-colors hover:text-accent" href="/dashboard">
            ← Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 animate-enter xl:grid-cols-[1.25fr_0.75fr]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Header */}
            <section className="hazard-top card p-4 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="label-stencil text-accent">Permit Detail</p>
                  <h1 className="mt-2 font-display text-3xl text-sand-bright lg:text-4xl">
                    {(permit.property_address || "UNKNOWN ADDRESS").toUpperCase()}
                  </h1>
                  <p className="mt-1 font-mono text-sm text-sand/60">
                    {permit.permit_number}
                  </p>
                  <div className="mt-4">
                    <LeadTypeBadge leadType={permit.lead_type} />
                  </div>
                </div>
                <PriorityBadge score={permit.priority_score} />
              </div>
            </section>

            {/* Property */}
            <section className="space-y-3">
              <h2 className="label-stencil-lg text-accent">Property</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="Address" wide>{permit.property_address || "—"}</Field>
                <Field label="City / State">
                  {[permit.city, permit.state].filter(Boolean).join(", ") || "—"}
                </Field>
                <Field label="Folio Number">
                  {propertyAppraiserUrl ? (
                    <a className="text-accent transition-colors hover:text-accent-hover" href={propertyAppraiserUrl} rel="noreferrer" target="_blank">
                      {permit.folio_number || "—"}
                    </a>
                  ) : (permit.folio_number || "—")}
                </Field>
                <Field label="Legal Description" wide>
                  {[permit.legal_description_1, permit.legal_description_2].filter(Boolean).join(" ") || "—"}
                </Field>
                <Field label="Square Footage">{permit.square_footage?.toLocaleString() || "—"}</Field>
                <Field label="Floors / Units">{permit.structure_floors ?? "—"} / {permit.structure_units ?? "—"}</Field>
              </dl>
            </section>

            {/* Permit */}
            <section className="space-y-3">
              <h2 className="label-stencil-lg text-accent">Permit</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="Permit Number">{permit.permit_number}</Field>
                <Field label="Process Number">{permit.process_number || "—"}</Field>
                <Field label="Master Permit">{permit.master_permit_number || "—"}</Field>
                <Field label="Permit Type">{permit.permit_type || "—"}</Field>
                <Field label="Application Type">{permit.application_type_description || "—"}</Field>
                <Field label="Description">{permit.detail_description || "—"}</Field>
                <Field label="Issued">{formatDateOnly(permit.permit_issued_date)}</Field>
                <Field label="Application Date">{formatDate(permit.application_date)}</Field>
                <Field label="Estimated Value">
                  <span className="font-mono">{formatEstimatedValue(permit.estimated_value)}</span>
                </Field>
                <Field label="Total Fee">{permit.permit_total_fee || "—"}</Field>
                <Field label="Proposed Use" wide>{permit.proposed_use_description || "—"}</Field>
              </dl>
            </section>

            {/* People */}
            <section className="space-y-3">
              <h2 className="label-stencil-lg text-accent">People</h2>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Field label="Owner">{permit.owner_name || "—"}</Field>
                <Field label="Architect">{permit.architect_name || "—"}</Field>
                <Field label="Contractor">{permit.contractor_name || "—"}</Field>
                <Field label="Contractor Phone">{permit.contractor_phone || "—"}</Field>
                <Field label="Contractor Address" wide>
                  {[permit.contractor_address, permit.contractor_city, permit.contractor_state, permit.contractor_zip].filter(Boolean).join(", ") || "—"}
                </Field>
              </dl>
            </section>

            {/* Inspection */}
            <section className="space-y-3">
              <h2 className="label-stencil-lg text-accent">Inspection</h2>
              <dl className="grid gap-3 sm:grid-cols-3">
                <Field label="Last Inspection">{renderValue(permit.last_inspection_date)}</Field>
                <Field label="Last Approved">{renderValue(permit.last_approved_insp_date)}</Field>
                <Field label="Certificate">{renderValue(permit.cocc_date)}</Field>
              </dl>
            </section>

            {/* Permit Ecosystem */}
            {ecosystem.length > 0 ? (
              <section className="space-y-3">
                <h2 className="label-stencil-lg text-accent">Permit Ecosystem</h2>
                <div className="card p-4">
                  <p className="text-xs text-sand/60 mb-3">{ecosystem.length} related permit(s) at this address/folio.</p>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {ecosystem.map((eco) => (
                      <div key={eco.id} className="flex items-start gap-3 rounded border border-stroke bg-bg-soft p-3">
                        <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${eco.relationship_type === "same_address" ? "bg-accent" : eco.relationship_type === "same_folio" ? "bg-teal" : "bg-amber"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs text-sand-bright">{eco.related_permit_number}</p>
                          <p className="mt-0.5 truncate text-xs text-sand">{eco.related_description || "No description"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {eco.related_value ? (
                            <p className="font-mono text-xs text-sand">{formatEstimatedValue(eco.related_value)}</p>
                          ) : null}
                          {eco.related_date ? (
                            <p className="font-mono text-[10px] text-sand/50">{formatDateOnly(eco.related_date)}</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {/* GC Profile */}
            {gcProfile ? (
              <section className="space-y-3">
                <h2 className="label-stencil-lg text-accent">GC Profile</h2>
                <div className="card p-4">
                  <p className="font-display text-lg text-sand-bright">{gcProfile.contractor_name}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-4">
                    <div className="rounded bg-bg-soft p-3">
                      <p className="label-stencil">Total Jobs</p>
                      <p className="mt-1 font-display text-2xl text-sand-bright">{gcProfile.total_jobs}</p>
                    </div>
                    <div className="rounded bg-bg-soft p-3">
                      <p className="label-stencil">Demo Jobs</p>
                      <p className="mt-1 font-display text-2xl text-accent">{gcProfile.demo_jobs}</p>
                    </div>
                    <div className="rounded bg-bg-soft p-3">
                      <p className="label-stencil">Avg Value</p>
                      <p className="mt-1 font-mono text-sm text-sand-bright">{formatEstimatedValue(gcProfile.avg_value)}</p>
                    </div>
                    <div className="rounded bg-bg-soft p-3">
                      <p className="label-stencil">Active Since</p>
                      <p className="mt-1 font-mono text-sm text-sand-bright">{formatDateOnly(gcProfile.first_seen)}</p>
                    </div>
                  </div>
                  {gcProfile.top_addresses.length > 0 ? (
                    <div className="mt-3">
                      <p className="label-stencil mb-2">Top Addresses</p>
                      <div className="space-y-1">
                        {gcProfile.top_addresses.map((addr, i) => (
                          <div key={i} className="flex items-center justify-between rounded bg-bg-soft px-3 py-2 text-xs">
                            <span className="text-sand">{addr.address}</span>
                            <span className="font-mono text-sand/50">{addr.count} permits</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {/* Property Owner */}
            {propertyOwner ? (
              <section className="space-y-3">
                <h2 className="label-stencil-lg text-accent">Property Owner</h2>
                <div className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-sand-bright">{propertyOwner.owner_name || "Unknown"}</p>
                      <span className="mt-1 inline-block rounded bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase text-accent">
                        {propertyOwner.owner_type || "unknown"}
                      </span>
                    </div>
                    {propertyOwner.assessed_value ? (
                      <div className="text-right">
                        <p className="label-stencil">Assessed</p>
                        <p className="mt-1 font-mono text-sm text-sand-bright">{formatEstimatedValue(propertyOwner.assessed_value)}</p>
                      </div>
                    ) : null}
                  </div>
                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    {propertyOwner.mailing_address ? (
                      <div className="rounded bg-bg-soft p-2">
                        <dt className="text-[10px] uppercase tracking-wider text-sand/50">Mailing</dt>
                        <dd className="text-xs text-sand">{propertyOwner.mailing_address}</dd>
                      </div>
                    ) : null}
                    {propertyOwner.land_use ? (
                      <div className="rounded bg-bg-soft p-2">
                        <dt className="text-[10px] uppercase tracking-wider text-sand/50">Land Use</dt>
                        <dd className="text-xs text-sand">{propertyOwner.land_use}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {propertyOwner.research_notes ? (
                    <div className="mt-3 rounded bg-bg-soft p-3">
                      <p className="label-stencil mb-1">Research Notes</p>
                      <p className="text-xs leading-relaxed text-sand/70">{propertyOwner.research_notes}</p>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {/* Map */}
            {mapsEmbedUrl ? (
              <section className="space-y-3">
                <h2 className="label-stencil-lg text-accent">Map</h2>
                <div className="overflow-hidden rounded-lg border border-stroke">
                  <iframe className="h-72 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapsEmbedUrl} title="Property map" />
                </div>
              </section>
            ) : null}

            {/* Source data */}
            <section className="card p-4">
              <h2 className="label-stencil">Source Record</h2>
              <p className="mt-1 text-xs text-sand/50">Original permit data from the county feed.</p>
              <pre className="mt-3 max-h-64 overflow-auto rounded bg-bg-soft p-4 font-mono text-xs text-sand/70">
                {JSON.stringify(permit.raw_data, null, 2)}
              </pre>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <section className="hazard-top card p-6">
              <h2 className="font-display text-xl text-sand-bright">LEAD TRACKING</h2>
              <p className="mt-1 text-sm text-sand">
                Manage pipeline status, review priority, and keep notes.
              </p>
              <div className="mt-5 mb-5 rounded-lg border border-stroke bg-bg-soft p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="label-stencil">Lead type</p>
                    <div className="mt-2"><LeadTypeBadge leadType={permit.lead_type} /></div>
                  </div>
                  <div>
                    <p className="label-stencil">Priority</p>
                    <div className="mt-2"><PriorityBadge score={permit.priority_score} /></div>
                  </div>
                </div>
              </div>
              <LeadDetailForm permit={permit} />
            </section>

            {/* Why This Lead — Close Probability */}
            {closeFactors ? (
              <section className="card p-6">
                <h2 className="font-display text-xl text-sand-bright">WHY THIS LEAD</h2>
                <p className="mt-1 text-sm text-sand">Close probability breakdown from the intelligence pipeline.</p>
                <div className="mt-4">
                  <div className="flex items-baseline gap-3">
                    <span className={`font-display text-4xl ${(closeFactors.total ?? 0) >= 70 ? "text-teal" : (closeFactors.total ?? 0) >= 40 ? "text-amber" : "text-sand"}`}>
                      {closeFactors.total ?? 0}%
                    </span>
                    <span className="label-stencil">Close Probability</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg-soft">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${(closeFactors.total ?? 0) >= 70 ? "bg-teal" : (closeFactors.total ?? 0) >= 40 ? "bg-amber" : "bg-sand/30"}`}
                      style={{ width: `${closeFactors.total ?? 0}%` }}
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { label: "Activity", score: closeFactors.activity_score, max: 40, reason: closeFactors.activity_reason },
                    { label: "GC Profile", score: closeFactors.gc_score, max: 30, reason: closeFactors.gc_reason },
                    { label: "Value", score: closeFactors.value_score, max: 20, reason: closeFactors.value_reason },
                    { label: "Owner", score: closeFactors.owner_score, max: 10, reason: closeFactors.owner_reason },
                  ].map((factor) => (
                    <div key={factor.label} className="rounded bg-bg-soft p-3">
                      <div className="flex items-center justify-between">
                        <span className="label-stencil">{factor.label}</span>
                        <span className="font-mono text-xs text-sand-bright">
                          {factor.score ?? 0}/{factor.max}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg-hover">
                        <div
                          className="h-full rounded-full bg-accent/60 transition-all duration-500"
                          style={{ width: `${((factor.score ?? 0) / factor.max) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-sand/60">{factor.reason ?? "—"}</p>
                    </div>
                  ))}
                </div>
                {permit.enriched_at ? (
                  <p className="mt-3 text-[10px] text-sand/40">
                    Last enriched: {formatDate(permit.enriched_at)}
                  </p>
                ) : null}
              </section>
            ) : null}

            <section className="card p-6">
              <h2 className="font-display text-xl text-sand-bright">RECENT ACTIVITY</h2>
              <p className="mt-1 text-sm text-sand">Latest five updates, newest first.</p>
              <div className="mt-5">
                <ActivityFeedList emptyState="No activity recorded for this lead yet." entries={recentActivity} />
              </div>
            </section>
          </aside>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
