import { getLeadTypeLabel, getLeadTypeStyles } from "@/lib/permits/lead-type";
import { PermitRecord } from "@/lib/types";

type Props = {
  leadType: PermitRecord["lead_type"];
};

export function LeadTypeBadge({ leadType }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${getLeadTypeStyles(leadType)}`}
    >
      {getLeadTypeLabel(leadType)}
    </span>
  );
}
