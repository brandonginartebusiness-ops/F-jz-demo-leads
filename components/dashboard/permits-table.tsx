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

type SortKey = "date" | "address" | "value" | "sqft" | "floors" | "priority" | "close";
type SortDir = "asc" | "desc";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function getCloseColor(probability: number | null) {
  if (probability === null) return "text-sand/40";
  if (probability >= 70) return "text-teal";
  if (probability >= 40) return "text-amber";
  return "text-sand";
}

function CloseBadge({ probability }: { probability: number | null }) {
  if (probability === null) return <span className="text-sand/40">—</span>;
  const color = getCloseColor(probability);
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold ${color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${probability >= 70 ? "bg-teal" : probability >= 40 ? "bg-amber" : "bg-sand/40"}`} />
      {probability}%
    </span>
  );
}

function getSortValue(permit: PermitRecord, key: SortKey): string | number {
  switch (key) {
    case "date": return permit.permit_issued_date ?? "";
    case "address": return permit.property_address ?? "";
    case "value": return permit.estimated_value ?? 0;
    case "sqft": return permit.square_footage ?? 0;
    case "floors": return permit.structure_floors ?? 0;
    case "priority": return permit.priority_score ?? 0;
    case "close": return permit.close_probability ?? 0;
  }
}

function SortHeader({
  label,
  sortKey: key,
  activeSortKey,
  sortDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey | null;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = activeSortKey === key;
  return (
    <th className="px-4 py-3">
      <button
        aria-label={`Sort by ${label}`}
        className={`inline-flex items-center gap-1 transition-colors hover:text-sand-bright ${active ? "text-accent" : ""}`}
        onClick={() => onSort(key)}
        type="button"
      >
        {label}
        <span className="text-[10px]">
          {active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
        </span>
      </button>
    </th>
  );
}

export function PermitsTable({ permits }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
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

  return (
    <>
      {/* Mobile card view */}
      <div className="space-y-2 md:hidden">
        {sorted.map((permit) => (
          <Link
            key={permit.id}
            className="block card p-4 transition-all duration-200 hover:border-sand/30"
            href={`/dashboard/${permit.id}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-sand-bright">
                  {permit.property_address || "Unknown address"}
                </p>
                <p className="mt-0.5 font-mono text-xs text-sand/60">
                  {formatDate(permit.permit_issued_date)}
                </p>
              </div>
              <PriorityBadge score={permit.priority_score} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <LeadTypeBadge leadType={permit.lead_type} />
              <span className="font-mono text-sm text-sand">
                {formatEstimatedValue(permit.estimated_value)}
              </span>
              <CloseBadge probability={permit.close_probability} />
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden" aria-label="Demolition permits">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 border-b border-stroke bg-bg-soft text-left">
              <tr className="label-stencil">
                <SortHeader label="Date" sortKey="date" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Address" sortKey="address" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <SortHeader label="Value" sortKey="value" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Sq Ft" sortKey="sqft" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Floors" sortKey="floors" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Contractor</th>
                <th className="px-4 py-3">Phone</th>
                <SortHeader label="Priority" sortKey="priority" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Close %" sortKey="close" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {sorted.map((permit) => (
                <tr
                  key={permit.id}
                  className="transition-colors duration-150 hover:bg-bg-soft/60"
                >
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-sand">
                    {formatDate(permit.permit_issued_date)}
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      className="font-medium text-sand-bright transition-colors hover:text-accent"
                      href={`/dashboard/${permit.id}`}
                    >
                      {permit.property_address || "Unknown address"}
                    </Link>
                    <p className="mt-0.5 font-mono text-[11px] text-sand/50">{permit.permit_number}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <LeadTypeBadge leadType={permit.lead_type} />
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3.5 text-sand">
                    {permit.detail_description || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-sand">
                    {formatEstimatedValue(permit.estimated_value)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-sand">
                    {permit.square_footage?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-sand">{permit.structure_floors ?? "—"}</td>
                  <td className="px-4 py-3.5 text-sand">{permit.owner_name || "—"}</td>
                  <td className="px-4 py-3.5 text-sand">{permit.contractor_name || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-sand">
                    {permit.contractor_phone || "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <PriorityBadge score={permit.priority_score} />
                  </td>
                  <td className="px-4 py-3.5">
                    <CloseBadge probability={permit.close_probability} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded border border-stroke bg-bg-soft px-2.5 py-1 text-xs font-medium capitalize text-sand">
                      {(permit.lead_status ?? "new").replace("_", " ")}
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
