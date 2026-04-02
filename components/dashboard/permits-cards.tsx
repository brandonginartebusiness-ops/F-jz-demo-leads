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
          className="panel p-5 transition hover:-translate-y-0.5 hover:border-accent hover:bg-panel-soft hover:shadow-lg hover:shadow-accent/5"
          href={`/dashboard/${permit.id}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {permit.property_address || "Unknown address"}
              </h3>
              <p className="mt-1 text-sm text-muted">{permit.permit_number}</p>
              <div className="mt-3">
                <LeadTypeBadge leadType={permit.lead_type} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <PriorityBadge score={permit.priority_score} />
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-silver">
                {permit.lead_status}
              </span>
            </div>
          </div>
          <dl className="mt-5 space-y-3 text-sm text-white/75">
            <div className="flex justify-between gap-4">
              <dt>Issued</dt>
              <dd>{formatDate(permit.permit_issued_date)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Description</dt>
              <dd className="max-w-[14rem] text-right">{permit.detail_description || "N/A"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Owner</dt>
              <dd className="text-right">{permit.owner_name || "Unknown"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Contractor</dt>
              <dd className="text-right">{permit.contractor_name || "Unknown"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Estimated value</dt>
              <dd>{formatEstimatedValue(permit.estimated_value)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Square footage</dt>
              <dd>{permit.square_footage?.toLocaleString() ?? "N/A"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Floors</dt>
              <dd>{permit.structure_floors ?? "N/A"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Phone</dt>
              <dd>{permit.contractor_phone || "N/A"}</dd>
            </div>
          </dl>
        </Link>
      ))}
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}
