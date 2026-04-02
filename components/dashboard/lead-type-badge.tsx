import { getLeadTypeLabel, getLeadTypeStyles } from "@/lib/permits/lead-type";
import { PermitRecord } from "@/lib/types";

type Props = {
  leadType: PermitRecord["lead_type"];
};

export function LeadTypeBadge({ leadType }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2.5 py-1 text-xs font-semibold uppercase tracking-stencil ${getLeadTypeStyles(leadType)}`}
    >
      {getLeadTypeLabel(leadType)}
    </span>
  );
}
