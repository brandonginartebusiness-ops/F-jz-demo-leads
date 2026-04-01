import Link from "next/link";
import { notFound } from "next/navigation";

import { LeadDetailForm } from "@/components/dashboard/lead-detail-form";
import { getPermitById } from "@/lib/permits/queries";

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

function formatCurrency(value: number | null) {
  if (value === null) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function PermitDetailPage({ params }: Props) {
  try {
    const permit = await getPermitById(params.id);

    return (
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link className="text-sm text-[#f2df9e] hover:text-white" href="/dashboard">
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#f2df9e]">
                Permit detail
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white">
                {permit.address || "Unknown address"}
              </h1>
              <p className="mt-2 text-sm text-white/60">FOLIO {permit.folio || "N/A"}</p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#11111d] p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">Issued</dt>
                <dd className="mt-2 text-base text-white">{formatDate(permit.issued_date)}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#11111d] p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">Estimated value</dt>
                <dd className="mt-2 text-base text-white">
                  {formatCurrency(permit.estimated_value)}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#11111d] p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">Contractor</dt>
                <dd className="mt-2 text-base text-white">
                  {permit.contractor_name || "Unknown contractor"}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#11111d] p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">Permit status</dt>
                <dd className="mt-2 text-base text-white">{permit.status || "N/A"}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#11111d] p-4 sm:col-span-2">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">Description</dt>
                <dd className="mt-2 text-base text-white">{permit.description || "N/A"}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#11111d] p-4 sm:col-span-2">
                <dt className="text-xs uppercase tracking-[0.2em] text-white/45">Standardized address</dt>
                <dd className="mt-2 text-base text-white">
                  {permit.standardized_address || "N/A"}
                </dd>
              </div>
            </dl>

            <div className="rounded-2xl border border-white/10 bg-[#11111d] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm uppercase tracking-[0.2em] text-white/45">
                    Source record
                  </h2>
                  <p className="mt-2 text-sm text-white/60">
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
            <LeadDetailForm permit={permit} />
          </aside>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
