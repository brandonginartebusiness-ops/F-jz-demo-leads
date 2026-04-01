import Link from "next/link";

import { PriorityBadge } from "@/components/dashboard/priority-badge";
import { PermitRecord } from "@/lib/types";

type Props = {
  permits: PermitRecord[];
};

function formatCurrency(value: number | null) {
  if (value === null) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PermitsCards({ permits }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {permits.map((permit) => (
        <Link
          key={permit.id}
          className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-5 transition hover:border-[#FF6B00] hover:bg-[#202020]"
          href={`/dashboard/${permit.id}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {permit.address || "Unknown address"}
              </h3>
              <p className="mt-1 text-sm text-[#888888]">{permit.folio}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <PriorityBadge
                label={permit.priority_label}
                score={permit.priority_score}
              />
              <span className="rounded-full bg-[#FF6B00]/15 px-3 py-1 text-xs font-medium text-[#C0C0C0]">
                {permit.lead_status}
              </span>
            </div>
          </div>
          <dl className="mt-5 space-y-3 text-sm text-white/75">
            <div className="flex justify-between gap-4">
              <dt>Contractor</dt>
              <dd className="text-right">{permit.contractor_name || "Unknown"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Permit status</dt>
              <dd>{permit.status || "N/A"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Estimated value</dt>
              <dd>{formatCurrency(permit.estimated_value)}</dd>
            </div>
          </dl>
        </Link>
      ))}
    </div>
  );
}
