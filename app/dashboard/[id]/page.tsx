import Link from "next/link";
import { notFound } from "next/navigation";

import { ActivityFeedList } from "@/components/dashboard/activity-feed-list";
import { LeadTypeBadge } from "@/components/dashboard/lead-type-badge";
import { PriorityBadge } from "@/components/dashboard/priority-badge";
import { LeadDetailForm } from "@/components/dashboard/lead-detail-form";
import { listPermitActivity } from "@/lib/activity-feed/queries";
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
    const recentActivity = await listPermitActivity(params.id, 5);
    const propertyAppraiserUrl = buildPropertyAppraiserUrl(permit.folio_number);
    const mapsEmbedUrl = buildMapsEmbedUrl(permit.property_address, permit.city, permit.state);

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
