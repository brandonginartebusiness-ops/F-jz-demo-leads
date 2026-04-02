import Link from "next/link";

import { LeadTypeBadge } from "@/components/dashboard/lead-type-badge";
import { PriorityBadge } from "@/components/dashboard/priority-badge";
import { formatEstimatedValue } from "@/lib/permits/value";
import { PermitRecord } from "@/lib/types";

type Props = {
  permits: PermitRecord[];
};

export function PermitsCards({ permits }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {permits.map((permit) => (
        <Link
          key={permit.id}
          className="group card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sand/30 hover:shadow-xl hover:shadow-black/20"
          href={`/dashboard/${permit.id}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-sand-bright group-hover:text-accent transition-colors">
                {permit.property_address || "Unknown address"}
              </h3>
              <p className="mt-1 font-mono text-xs text-sand/50">{permit.permit_number}</p>
              <div className="mt-3">
                <LeadTypeBadge leadType={permit.lead_type} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <PriorityBadge score={permit.priority_score} />
              <span className="rounded border border-stroke bg-bg-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-stencil text-sand">
                {permit.lead_status}
              </span>
            </div>
          </div>

          <dl className="mt-5 space-y-2 border-t border-stroke pt-4 text-sm">
            {[
              ["Issued", formatDate(permit.permit_issued_date)],
              ["Value", formatEstimatedValue(permit.estimated_value)],
              ["Owner", permit.owner_name || "—"],
              ["Contractor", permit.contractor_name || "—"],
              ["Sq Ft", permit.square_footage?.toLocaleString() ?? "—"],
              ["Floors", String(permit.structure_floors ?? "—")],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-sand/60">{label}</dt>
                <dd className="text-right font-mono text-sand">{value}</dd>
              </div>
            ))}
          </dl>
        </Link>
      ))}
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}
