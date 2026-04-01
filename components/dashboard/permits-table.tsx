import Link from "next/link";

import { PriorityBadge } from "@/components/dashboard/priority-badge";
import { formatEstimatedValue } from "@/lib/permits/value";
import { PermitRecord } from "@/lib/types";

type Props = {
  permits: PermitRecord[];
};

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function PermitsTable({ permits }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#FF6B00]/25 text-sm">
          <thead className="bg-[#1f1f1f] text-left text-xs uppercase tracking-[0.2em] text-[#888888]">
            <tr>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Issued</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Sq Ft</th>
              <th className="px-4 py-3">Floors</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Contractor</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Lead status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FF6B00]/25">
            {permits.map((permit) => (
              <tr key={permit.id} className="hover:bg-[#202020]">
                <td className="px-4 py-4">
                  <Link
                    className="font-medium text-white transition hover:text-[#C0C0C0]"
                    href={`/dashboard/${permit.id}`}
                  >
                    {permit.property_address || "Unknown address"}
                  </Link>
                  <p className="mt-1 text-xs text-[#888888]">{permit.permit_number}</p>
                </td>
                <td className="px-4 py-4 text-white/80">
                  {permit.detail_description || "N/A"}
                </td>
                <td className="px-4 py-4 text-white/80">{formatDate(permit.permit_issued_date)}</td>
                <td className="px-4 py-4 text-white/80">
                  {formatEstimatedValue(permit.estimated_value)}
                </td>
                <td className="px-4 py-4 text-white/80">
                  {permit.square_footage?.toLocaleString() ?? "N/A"}
                </td>
                <td className="px-4 py-4 text-white/80">{permit.structure_floors ?? "N/A"}</td>
                <td className="px-4 py-4 text-white/80">{permit.owner_name || "N/A"}</td>
                <td className="px-4 py-4 text-white/80">
                  {permit.contractor_name || "Unknown contractor"}
                </td>
                <td className="px-4 py-4 text-white/80">{permit.contractor_phone || "N/A"}</td>
                <td className="px-4 py-4">
                  <PriorityBadge score={permit.priority_score} />
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-[#FF6B00]/15 px-3 py-1 text-xs font-medium text-[#C0C0C0]">
                    {permit.lead_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
