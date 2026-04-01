import Link from "next/link";

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

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function PermitsTable({ permits }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.2em] text-white/60">
            <tr>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Contractor</th>
              <th className="px-4 py-3">Issued</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Lead status</th>
              <th className="px-4 py-3">Permit status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {permits.map((permit) => (
              <tr key={permit.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-4">
                  <Link
                    className="font-medium text-white transition hover:text-[#f2df9e]"
                    href={`/dashboard/${permit.id}`}
                  >
                    {permit.address || "Unknown address"}
                  </Link>
                  <p className="mt-1 text-xs text-white/50">{permit.folio}</p>
                </td>
                <td className="px-4 py-4 text-white/80">
                  {permit.contractor_name || "Unknown contractor"}
                </td>
                <td className="px-4 py-4 text-white/80">{formatDate(permit.issued_date)}</td>
                <td className="px-4 py-4 text-white/80">
                  {formatCurrency(permit.estimated_value)}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-[#c9a84c]/15 px-3 py-1 text-xs font-medium text-[#f2df9e]">
                    {permit.lead_status}
                  </span>
                </td>
                <td className="px-4 py-4 text-white/80">{permit.status || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
