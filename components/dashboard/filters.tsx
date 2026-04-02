"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { DashboardSearchParams } from "@/lib/permits/queries";

type FiltersProps = {
  searchParams: DashboardSearchParams;
};

export function DashboardFilters({ searchParams }: FiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const nextView = searchParams.view === "cards" ? "table" : "cards";
  const currentParams = buildSearchParams(searchParams);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
      const normalizedValue = String(value).trim();
      if (normalizedValue) {
        params.set(key, normalizedValue);
      }
    });

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="card p-5">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 lg:grid-cols-10">
          <input
            aria-label="Search permits"
            className="input-compact lg:col-span-4"
            defaultValue={searchParams.search}
            name="search"
            placeholder="Search address, owner, contractor..."
          />
          <select
            aria-label="Filter by lead type"
            className="input-compact"
            defaultValue={searchParams.leadType ?? ""}
            name="leadType"
          >
            <option value="">All lead types</option>
            <option value="full_demolition">Full Demo</option>
            <option value="partial_demolition">Partial Demo</option>
            <option value="demo_related">Demo Related</option>
            <option value="junk">Junk</option>
          </select>
          <select
            aria-label="Filter by status"
            className="input-compact"
            defaultValue={searchParams.leadStatus ?? ""}
            name="leadStatus"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="bookmarked">Bookmarked</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In progress</option>
            <option value="closed_won">Closed won</option>
            <option value="closed_lost">Closed lost</option>
          </select>
          <select
            aria-label="Filter by priority"
            className="input-compact"
            defaultValue={searchParams.priorityLabel ?? ""}
            name="priorityLabel"
          >
            <option value="">All priorities</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Low">Low</option>
          </select>

        </div>

        <div className="grid gap-3 lg:grid-cols-10">
          <input
            aria-label="Date from"
            className="input-compact"
            defaultValue={searchParams.dateFrom}
            name="dateFrom"
            type="date"
          />
          <input
            aria-label="Date to"
            className="input-compact"
            defaultValue={searchParams.dateTo}
            name="dateTo"
            type="date"
          />
          <select
            aria-label="Sort order"
            className="input-compact"
            defaultValue={searchParams.sort ?? "priority_desc"}
            name="sort"
          >
            <option value="priority_desc">Highest priority</option>
            <option value="priority_asc">Lowest priority</option>
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="value_desc">Highest value</option>
            <option value="value_asc">Lowest value</option>
            <option value="sqft_desc">Largest sq ft</option>
            <option value="sqft_asc">Smallest sq ft</option>
          </select>
          <input
            className="input-compact"
            defaultValue={searchParams.minValue}
            name="minValue"
            placeholder="Min value"
            type="number"
          />
          <input
            className="input-compact"
            defaultValue={searchParams.maxValue}
            name="maxValue"
            placeholder="Max value"
            type="number"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            className="btn-ghost-sm text-xs"
            onClick={() => setExpanded((v) => !v)}
            type="button"
          >
            {expanded ? "Hide advanced" : "Advanced"}
          </button>
        </div>

        <div className={`grid gap-3 lg:grid-cols-4 ${expanded ? "" : "hidden"}`}>
          <input
            className="input-compact"
            defaultValue={searchParams.minSqFt}
            name="minSqFt"
            placeholder="Min sq ft"
            type="number"
          />
          <input
            className="input-compact"
            defaultValue={searchParams.maxSqFt}
            name="maxSqFt"
            placeholder="Max sq ft"
            type="number"
          />
          <select
            aria-label="Show or hide junk leads"
            className="input-compact"
            defaultValue={searchParams.showJunk ?? "false"}
            name="showJunk"
          >
            <option value="false">Hide junk</option>
            <option value="true">Show junk</option>
          </select>
          <select
            aria-label="Commercial or all properties"
            className="input-compact"
            defaultValue={searchParams.showResidential ?? "false"}
            name="showResidential"
          >
            <option value="false">Commercial only</option>
            <option value="true">Show residential too</option>
          </select>
        </div>

        <input name="view" type="hidden" value={searchParams.view ?? "table"} />

        <div className="flex flex-col gap-3 border-t border-stroke pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="inline-flex w-full flex-wrap rounded-xl border border-stroke bg-[#0f0f0f] p-1 lg:w-auto"
            role="group"
            aria-label="Quick lead type filters"
          >
            <LeadTypeLink currentParams={currentParams} label="Full Demo" pathname={pathname} searchParams={searchParams} value="full_demolition" />
            <LeadTypeLink currentParams={currentParams} label="Partial" pathname={pathname} searchParams={searchParams} value="partial_demolition" />
            <LeadTypeLink currentParams={currentParams} label="Related" pathname={pathname} searchParams={searchParams} value="demo_related" />
            <LeadTypeLink currentParams={currentParams} label="Show All" pathname={pathname} searchParams={searchParams} value="" />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button className="btn-accent-sm" type="submit">
              Apply
            </button>
            <Link className="btn-ghost-sm text-xs" href="/dashboard">
              Reset
            </Link>
            <Link
              className="btn-ghost-sm text-xs"
              href={`/dashboard?${new URLSearchParams({ ...currentParams, view: nextView }).toString()}`}
            >
              {nextView === "cards" ? "Cards" : "Table"}
            </Link>
            <Link
              className="btn-ghost-sm text-xs"
              href={`/api/export?${new URLSearchParams(currentParams).toString()}`}
            >
              Export CSV
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

type LeadTypeLinkProps = {
  pathname: string;
  currentParams: Record<string, string>;
  searchParams: DashboardSearchParams;
  value: string;
  label: string;
};

function LeadTypeLink({ pathname, currentParams, searchParams, value, label }: LeadTypeLinkProps) {
  const nextParams = new URLSearchParams(currentParams);
  if (value) {
    nextParams.set("leadType", value);
    nextParams.set("showJunk", "false");
  } else {
    nextParams.delete("leadType");
    nextParams.set("showJunk", "true");
  }

  const isActive = (searchParams.leadType ?? "") === value;

  return (
    <Link
      className={`rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-stencil transition-all duration-200 ${
        isActive
          ? "bg-accent text-white"
          : "border border-transparent text-sand hover:border-stroke hover:text-sand-bright"
      }`}
      href={nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname}
    >
      {label}
    </Link>
  );
}

function buildSearchParams(searchParams: DashboardSearchParams) {
  return Object.fromEntries(
    Object.entries(searchParams).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0 && value.some(Boolean);
      }
      return Boolean(value);
    }),
  );
}
