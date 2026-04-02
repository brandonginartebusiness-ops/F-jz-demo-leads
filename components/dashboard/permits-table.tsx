"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { LeadTypeBadge } from "@/components/dashboard/lead-type-badge";
import { PriorityBadge } from "@/components/dashboard/priority-badge";
import { formatEstimatedValue } from "@/lib/permits/value";
import { PermitRecord } from "@/lib/types";

type Props = {
  permits: PermitRecord[];
};

type SortKey = "date" | "address" | "value" | "sqft" | "floors" | "priority";
type SortDir = "asc" | "desc";

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDir }) {
  if (!active) {
    return <span className="ml-1 text-muted/40">&darr;</span>;
  }
  return (
    <span className="ml-1 text-accent">
      {direction === "asc" ? "\u2191" : "\u2193"}
    </span>
  );
}

const SORTABLE_COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: "date", label: "Date" },
  { key: "address", label: "Address" },
];

const STATIC_COLUMNS = ["Type", "Description"];

const SORTABLE_NUMERIC: Array<{ key: SortKey; label: string }> = [
  { key: "value", label: "Value" },
  { key: "sqft", label: "Sq Ft" },
  { key: "floors", label: "Floors" },
];

function getSortValue(permit: PermitRecord, key: SortKey): string | number {
  switch (key) {
    case "date":
      return permit.permit_issued_date ?? "";
    case "address":
      return permit.property_address ?? "";
    case "value":
      return permit.estimated_value ?? 0;
    case "sqft":
      return permit.square_footage ?? 0;
    case "floors":
      return permit.structure_floors ?? 0;
    case "priority":
      return permit.priority_score ?? 0;
  }
}

export function PermitsTable({ permits }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return permits;
    return [...permits].sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [permits, sortKey, sortDir]);

  function SortButton({ sortKeyValue, children }: { sortKeyValue: SortKey; children: React.ReactNode }) {
    return (
      <button
        aria-label={`Sort by ${children}`}
        className="inline-flex items-center hover:text-silver transition-colors"
        onClick={() => toggleSort(sortKeyValue)}
        type="button"
      >
        {children}
        <SortIcon active={sortKey === sortKeyValue} direction={sortDir} />
      </button>
    );
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {sorted.map((permit) => (
          <Link
            key={permit.id}
            className="block panel p-4 transition hover:border-accent"
            href={`/dashboard/${permit.id}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">
                  {permit.property_address || "Unknown address"}
                </p>
                <p className="mt-1 text-xs text-muted">{formatDate(permit.permit_issued_date)}</p>
              </div>
              <PriorityBadge score={permit.priority_score} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <LeadTypeBadge leadType={permit.lead_type} />
              <span className="text-sm text-silver">
                {formatEstimatedValue(permit.estimated_value)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-hidden panel" aria-label="Demolition permits">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="sticky top-0 z-10 bg-panel-soft text-left section-label">
              <tr>
                {SORTABLE_COLUMNS.map((col) => (
                  <th key={col.key} className="px-4 py-3">
                    <SortButton sortKeyValue={col.key}>{col.label}</SortButton>
                  </th>
                ))}
                {STATIC_COLUMNS.map((label) => (
                  <th key={label} className="px-4 py-3">{label}</th>
                ))}
                {SORTABLE_NUMERIC.map((col) => (
                  <th key={col.key} className="px-4 py-3">
                    <SortButton sortKeyValue={col.key}>{col.label}</SortButton>
                  </th>
                ))}
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Contractor</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">
                  <SortButton sortKeyValue="priority">Priority</SortButton>
                </th>
                <th className="px-4 py-3">Lead status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((permit) => (
                <tr key={permit.id} className="transition-colors duration-150 hover:bg-panel-soft/60">
                  <td className="px-4 py-4 text-white/80">{formatDate(permit.permit_issued_date)}</td>
                  <td className="px-4 py-4">
                    <Link
                      className="font-medium text-white underline-offset-2 transition hover:text-silver hover:underline"
                      href={`/dashboard/${permit.id}`}
                    >
                      {permit.property_address || "Unknown address"}
                    </Link>
                    <p className="mt-1 text-xs text-muted">{permit.permit_number}</p>
                  </td>
                  <td className="px-4 py-4">
                    <LeadTypeBadge leadType={permit.lead_type} />
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-4 text-white/80">
                    {permit.detail_description || "N/A"}
                  </td>
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
                    <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-silver">
                      {permit.lead_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
