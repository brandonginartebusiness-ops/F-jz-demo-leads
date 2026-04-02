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
  params: {
    id: string;
  };
};

function formatDate(value: string | null) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDateOnly(value: string | null) {
  if (!value) return "N/A";

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
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
}

function DataCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="panel p-4">
      <dt className="section-label">{label}</dt>
      <dd className="mt-2 text-base text-white">{children}</dd>
    </div>
  );
}

export default async function PermitDetailPage({ params }: Props) {
  try {
    const permit = await getPermitById(params.id);
    const recentActivity = await listPermitActivity(params.id, 5);
    const propertyAppraiserUrl = buildPropertyAppraiserUrl(permit.folio_number);
    const mapsEmbedUrl = buildMapsEmbedUrl(
      permit.property_address,
      permit.city,
      permit.state,
    );

    return (
      <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link className="text-sm text-silver transition hover:text-white" href="/dashboard">
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 animate-fade-in xl:grid-cols-[1.25fr_0.75fr]">
          <section className="space-y-6 panel-lg p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="page-label">
                  Permit detail
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-white">
                  {permit.property_address || "Unknown address"}
                </h1>
                <p className="mt-2 text-sm text-muted">
                  Permit {permit.permit_number}
                </p>
                <div className="mt-4">
                  <LeadTypeBadge leadType={permit.lead_type} />
                </div>
              </div>
              <PriorityBadge score={permit.priority_score} />
            </div>

            <section className="space-y-4">
              <h2 className="section-label">Property</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="panel p-4 sm:col-span-2">
                  <dt className="section-label">Address</dt>
                  <dd className="mt-2 text-base text-white">{permit.property_address || "N/A"}</dd>
                </div>
                <DataCard label="City / State">
                  {[permit.city, permit.state].filter(Boolean).join(", ") || "N/A"}
                </DataCard>
                <DataCard label="Folio Number">
                  {propertyAppraiserUrl ? (
                    <a
                      className="text-accent transition hover:text-accent-hover"
                      href={propertyAppraiserUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {permit.folio_number || "N/A"}
                    </a>
                  ) : (
                    permit.folio_number || "N/A"
                  )}
                </DataCard>
                <div className="panel p-4 sm:col-span-2">
                  <dt className="section-label">Legal Description</dt>
                  <dd className="mt-2 text-base text-white">
                    {[permit.legal_description_1, permit.legal_description_2]
                      .filter(Boolean)
                      .join(" ") || "N/A"}
                  </dd>
                </div>
                <DataCard label="Square Footage">
                  {permit.square_footage?.toLocaleString() || "N/A"}
                </DataCard>
                <DataCard label="Floors / Units">
                  {permit.structure_floors ?? "N/A"} / {permit.structure_units ?? "N/A"}
                </DataCard>
              </dl>
            </section>

            <section className="space-y-4">
              <h2 className="section-label">Permit</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DataCard label="Permit Number">{permit.permit_number}</DataCard>
                <DataCard label="Process Number">{permit.process_number || "N/A"}</DataCard>
                <DataCard label="Master Permit Number">{permit.master_permit_number || "N/A"}</DataCard>
                <DataCard label="Permit Type">{permit.permit_type || "N/A"}</DataCard>
                <DataCard label="Application Type">{permit.application_type_description || "N/A"}</DataCard>
                <DataCard label="Lead Type">
                  <LeadTypeBadge leadType={permit.lead_type} />
                </DataCard>
                <DataCard label="Description">{permit.detail_description || "N/A"}</DataCard>
                <DataCard label="Issued Date">{formatDateOnly(permit.permit_issued_date)}</DataCard>
                <DataCard label="Application Date">{formatDate(permit.application_date)}</DataCard>
                <DataCard label="Estimated Value">{formatEstimatedValue(permit.estimated_value)}</DataCard>
                <DataCard label="Permit Total Fee">{permit.permit_total_fee || "N/A"}</DataCard>
                <div className="panel p-4 sm:col-span-2">
                  <dt className="section-label">Proposed Use</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.proposed_use_description || "N/A"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="space-y-4">
              <h2 className="section-label">People</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DataCard label="Owner">{permit.owner_name || "N/A"}</DataCard>
                <DataCard label="Architect">{permit.architect_name || "N/A"}</DataCard>
                <DataCard label="Contractor">{permit.contractor_name || "N/A"}</DataCard>
                <DataCard label="Contractor Phone">{permit.contractor_phone || "N/A"}</DataCard>
                <div className="panel p-4 sm:col-span-2">
                  <dt className="section-label">Contractor Address</dt>
                  <dd className="mt-2 text-base text-white">
                    {[
                      permit.contractor_address,
                      permit.contractor_city,
                      permit.contractor_state,
                      permit.contractor_zip,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="space-y-4">
              <h2 className="section-label">Inspection</h2>
              <dl className="grid gap-4 sm:grid-cols-3">
                <DataCard label="Last Inspection">{renderValue(permit.last_inspection_date)}</DataCard>
                <DataCard label="Last Approved Inspection">{renderValue(permit.last_approved_insp_date)}</DataCard>
                <DataCard label="Certificate of Completion">{renderValue(permit.cocc_date)}</DataCard>
              </dl>
            </section>

            {mapsEmbedUrl ? (
              <section className="space-y-4">
                <h2 className="section-label">Map</h2>
                <div className="overflow-hidden rounded-2xl border border-border">
                  <iframe
                    className="h-72 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapsEmbedUrl}
                    title="Property map"
                  />
                </div>
              </section>
            ) : null}

            <div className="panel p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="section-label">Source record</h2>
                  <p className="mt-2 text-sm text-muted">
                    This is the original permit data returned by the county feed for
                    this record.
                  </p>
                </div>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-xl bg-panel-soft p-4 text-xs text-white/70">
                {JSON.stringify(permit.raw_data, null, 2)}
              </pre>
            </div>
          </section>

          <aside>
            <div className="space-y-6">
              <section className="panel p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white">Lead Tracking</h2>
                  <p className="mt-1 text-sm text-muted">
                    Manage pipeline status, review priority, and keep notes on this lead.
                  </p>
                </div>
                <div className="mb-5 rounded-2xl border border-accent/20 bg-panel-soft p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="section-label">Lead type</p>
                      <div className="mt-2">
                        <LeadTypeBadge leadType={permit.lead_type} />
                      </div>
                    </div>
                    <div>
                      <p className="section-label">Priority score</p>
                      <div className="mt-2">
                        <PriorityBadge score={permit.priority_score} />
                      </div>
                    </div>
                  </div>
                </div>
                <LeadDetailForm permit={permit} />
              </section>

              <section className="panel p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white">Recent activity</h2>
                  <p className="mt-1 text-sm text-muted">
                    The latest five updates for this lead, newest first.
                  </p>
                </div>

                <ActivityFeedList
                  emptyState="No activity has been recorded for this lead yet."
                  entries={recentActivity}
                />
              </section>
            </div>
          </aside>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
