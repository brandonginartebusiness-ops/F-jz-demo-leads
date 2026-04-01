import Link from "next/link";
import { notFound } from "next/navigation";

import { ActivityFeedList } from "@/components/dashboard/activity-feed-list";
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
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link className="text-sm text-[#C0C0C0] hover:text-white" href="/dashboard">
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="space-y-6 rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#C0C0C0]">
                  Permit detail
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-white">
                  {permit.property_address || "Unknown address"}
                </h1>
                <p className="mt-2 text-sm text-[#888888]">
                  Permit {permit.permit_number}
                </p>
              </div>
              <PriorityBadge score={permit.priority_score} />
            </div>

            <section className="space-y-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-[#888888]">Property</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Address</dt>
                  <dd className="mt-2 text-base text-white">{permit.property_address || "N/A"}</dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">City / State</dt>
                  <dd className="mt-2 text-base text-white">
                    {[permit.city, permit.state].filter(Boolean).join(", ") || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Folio Number</dt>
                  <dd className="mt-2 text-base text-white">
                    {propertyAppraiserUrl ? (
                      <a
                        className="text-[#FF6B00] hover:text-[#FF8C00]"
                        href={propertyAppraiserUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {permit.folio_number || "N/A"}
                      </a>
                    ) : (
                      permit.folio_number || "N/A"
                    )}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Legal Description</dt>
                  <dd className="mt-2 text-base text-white">
                    {[permit.legal_description_1, permit.legal_description_2]
                      .filter(Boolean)
                      .join(" ") || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Square Footage</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.square_footage?.toLocaleString() || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Floors / Units</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.structure_floors ?? "N/A"} / {permit.structure_units ?? "N/A"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-[#888888]">Permit</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Permit Number</dt>
                  <dd className="mt-2 text-base text-white">{permit.permit_number}</dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Process Number</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.process_number || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Master Permit Number</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.master_permit_number || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Permit Type</dt>
                  <dd className="mt-2 text-base text-white">{permit.permit_type || "N/A"}</dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Application Type</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.application_type_description || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Description</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.detail_description || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Issued Date</dt>
                  <dd className="mt-2 text-base text-white">
                    {formatDateOnly(permit.permit_issued_date)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Application Date</dt>
                  <dd className="mt-2 text-base text-white">
                    {formatDate(permit.application_date)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Estimated Value</dt>
                  <dd className="mt-2 text-base text-white">
                    {formatEstimatedValue(permit.estimated_value)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Permit Total Fee</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.permit_total_fee || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Proposed Use</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.proposed_use_description || "N/A"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-[#888888]">People</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Owner</dt>
                  <dd className="mt-2 text-base text-white">{permit.owner_name || "N/A"}</dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Architect</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.architect_name || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Contractor</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.contractor_name || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Contractor Phone</dt>
                  <dd className="mt-2 text-base text-white">
                    {permit.contractor_phone || "N/A"}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Contractor Address</dt>
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
              <h2 className="text-sm uppercase tracking-[0.2em] text-[#888888]">Inspection</h2>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Last Inspection</dt>
                  <dd className="mt-2 text-base text-white">
                    {renderValue(permit.last_inspection_date)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Last Approved Inspection</dt>
                  <dd className="mt-2 text-base text-white">
                    {renderValue(permit.last_approved_insp_date)}
                  </dd>
                </div>
                <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
                  <dt className="text-xs uppercase tracking-[0.2em] text-[#888888]">Certificate of Completion</dt>
                  <dd className="mt-2 text-base text-white">{renderValue(permit.cocc_date)}</dd>
                </div>
              </dl>
            </section>

            {mapsEmbedUrl ? (
              <section className="space-y-4">
                <h2 className="text-sm uppercase tracking-[0.2em] text-[#888888]">Map</h2>
                <div className="overflow-hidden rounded-2xl border border-[#FF6B00]/25">
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

            <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm uppercase tracking-[0.2em] text-[#888888]">
                    Source record
                  </h2>
                  <p className="mt-2 text-sm text-[#888888]">
                    This is the original permit data returned by the county feed for
                    this record.
                  </p>
                </div>
              </div>
              <pre className="mt-4 overflow-x-auto text-xs text-white/70">
                {JSON.stringify(permit.raw_data, null, 2)}
              </pre>
            </div>
          </section>

          <aside>
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white">Lead Tracking</h2>
                  <p className="mt-1 text-sm text-[#888888]">
                    Manage pipeline status, review priority, and keep notes on this lead.
                  </p>
                </div>
                <div className="mb-5 rounded-2xl border border-[#FF6B00]/20 bg-[#202020] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">
                    Priority score
                  </p>
                  <div className="mt-2">
                    <PriorityBadge score={permit.priority_score} />
                  </div>
                </div>
                <LeadDetailForm permit={permit} />
              </section>

              <section className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white">Recent activity</h2>
                  <p className="mt-1 text-sm text-[#888888]">
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
