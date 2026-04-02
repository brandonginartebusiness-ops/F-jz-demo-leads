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
    <div className="panel p-5">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Always-visible: search + quick filters */}
        <div className="grid gap-4 lg:grid-cols-6">
          <input
            aria-label="Search permits"
            className="input-sm lg:col-span-2"
            defaultValue={searchParams.search}
            name="search"
            placeholder="Search address, owner, contractor, or permit"
          />
          <select
            aria-label="Filter by lead type"
            className="input-sm"
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
            aria-label="Filter by lead status"
            className="input-sm"
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
            className="input-sm"
            defaultValue={searchParams.priorityLabel ?? ""}
            name="priorityLabel"
          >
            <option value="">All priorities</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Low">Low</option>
          </select>

          {/* Toggle for advanced filters on mobile */}
          <button
            className="btn-outline-sm lg:hidden"
            onClick={() => setExpanded((v) => !v)}
            type="button"
          >
            {expanded ? "Hide filters" : "More filters"}
          </button>
        </div>

        {/* Advanced filters — always visible on lg+, toggled on mobile */}
        <div className={`grid gap-4 lg:grid-cols-6 ${expanded ? "" : "hidden lg:grid"}`}>
          <input
            aria-label="Date from"
            className="input-sm"
            defaultValue={searchParams.dateFrom}
            name="dateFrom"
            type="date"
          />
          <input
            aria-label="Date to"
            className="input-sm"
            defaultValue={searchParams.dateTo}
            name="dateTo"
            type="date"
          />
          <select
            aria-label="Sort order"
            className="input-sm"
            defaultValue={searchParams.sort ?? "priority_desc"}
            name="sort"
          >
            <option value="priority_desc">Highest priority</option>
            <option value="priority_asc">Lowest priority</option>
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="value_desc">Highest value</option>
            <option value="value_asc">Lowest value</option>
            <option value="sqft_desc">Largest square footage</option>
            <option value="sqft_asc">Smallest square footage</option>
          </select>
          <input
            className="input-sm"
            defaultValue={searchParams.minValue}
            name="minValue"
            placeholder="Min value"
            type="number"
          />
          <input
            className="input-sm"
            defaultValue={searchParams.maxValue}
            name="maxValue"
            placeholder="Max value"
            type="number"
          />
          <input
            className="input-sm"
            defaultValue={searchParams.minSqFt}
            name="minSqFt"
            placeholder="Min sq ft"
            type="number"
          />
          <input
            className="input-sm"
            defaultValue={searchParams.maxSqFt}
            name="maxSqFt"
            placeholder="Max sq ft"
            type="number"
          />
          <select
            aria-label="Show or hide junk leads"
            className="input-sm"
            defaultValue={searchParams.showJunk ?? "false"}
            name="showJunk"
          >
            <option value="false">Hide junk</option>
            <option value="true">Show junk</option>
          </select>
        </div>

        <input name="view" type="hidden" value={searchParams.view ?? "table"} />

        <div className="flex flex-wrap gap-3" role="group" aria-label="Quick lead type filters">
          <LeadTypeLink
            currentParams={currentParams}
            label="Full Demo"
            pathname={pathname}
            searchParams={searchParams}
            value="full_demolition"
          />
          <LeadTypeLink
            currentParams={currentParams}
            label="Partial Demo"
            pathname={pathname}
            searchParams={searchParams}
            value="partial_demolition"
          />
          <LeadTypeLink
            currentParams={currentParams}
            label="Demo Related"
            pathname={pathname}
            searchParams={searchParams}
            value="demo_related"
          />
          <LeadTypeLink
            currentParams={currentParams}
            label="Show All"
            pathname={pathname}
            searchParams={searchParams}
            value=""
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="btn-sm" type="submit">
            Apply filters
          </button>
          <Link className="btn-outline-sm" href="/dashboard">
            Reset
          </Link>
          <Link
            className="btn-outline-sm"
            href={`/dashboard?${new URLSearchParams({
              ...currentParams,
              view: nextView,
            }).toString()}`}
          >
            {nextView === "cards" ? "Card view" : "Table view"}
          </Link>
          <Link
            className="btn-outline-sm"
            href={`/api/export?${new URLSearchParams(currentParams).toString()}`}
          >
            Export CSV
          </Link>
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

function LeadTypeLink({
  pathname,
  currentParams,
  searchParams,
  value,
  label,
}: LeadTypeLinkProps) {
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
      className={`rounded-full px-4 py-2 text-sm transition ${
        isActive
          ? "bg-accent text-background"
          : "border border-border text-silver hover:border-accent"
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
