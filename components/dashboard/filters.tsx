"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent } from "react";

import { DashboardSearchParams } from "@/lib/permits/queries";

type FiltersProps = {
  searchParams: DashboardSearchParams;
};

export function DashboardFilters({ searchParams }: FiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const baseInputClassName =
    "rounded-lg border border-[#FF6B00]/25 bg-[#1a1a1a] px-3 py-2 text-sm text-white outline-none transition focus:border-[#FF6B00]";
  const selectClassName = `${baseInputClassName} text-black`;

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
    <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-5">
      <form className="grid gap-4 lg:grid-cols-6" onSubmit={handleSubmit}>
        <input
          className={`lg:col-span-2 ${baseInputClassName}`}
          defaultValue={searchParams.search}
          name="search"
          placeholder="Search address, owner, contractor, or permit"
        />
        <select
          className={selectClassName}
          defaultValue={searchParams.leadType ?? ""}
          name="leadType"
        >
          <option className="text-black" value="">
            All lead types
          </option>
          <option className="text-black" value="full_demolition">
            Full Demo
          </option>
          <option className="text-black" value="partial_demolition">
            Partial Demo
          </option>
          <option className="text-black" value="demo_related">
            Demo Related
          </option>
          <option className="text-black" value="junk">
            Junk
          </option>
        </select>
        <select
          className={selectClassName}
          defaultValue={searchParams.leadStatus ?? ""}
          name="leadStatus"
        >
          <option className="text-black" value="">
            All statuses
          </option>
          <option className="text-black" value="new">
            New
          </option>
          <option className="text-black" value="bookmarked">
            Bookmarked
          </option>
          <option className="text-black" value="contacted">
            Contacted
          </option>
          <option className="text-black" value="in_progress">
            In progress
          </option>
          <option className="text-black" value="closed_won">
            Closed won
          </option>
          <option className="text-black" value="closed_lost">
            Closed lost
          </option>
        </select>
        <select
          className={selectClassName}
          defaultValue={searchParams.priorityLabel ?? ""}
          name="priorityLabel"
        >
          <option className="text-black" value="">
            All priorities
          </option>
          <option className="text-black" value="Hot">
            Hot
          </option>
          <option className="text-black" value="Warm">
            Warm
          </option>
          <option className="text-black" value="Low">
            Low
          </option>
        </select>
        <input
          className={baseInputClassName}
          defaultValue={searchParams.dateFrom}
          name="dateFrom"
          type="date"
        />
        <input
          className={baseInputClassName}
          defaultValue={searchParams.dateTo}
          name="dateTo"
          type="date"
        />
        <select
          className={selectClassName}
          defaultValue={searchParams.sort ?? "priority_desc"}
          name="sort"
        >
          <option className="text-black" value="priority_desc">
            Highest priority
          </option>
          <option className="text-black" value="priority_asc">
            Lowest priority
          </option>
          <option className="text-black" value="date_desc">
            Newest first
          </option>
          <option className="text-black" value="date_asc">
            Oldest first
          </option>
          <option className="text-black" value="value_desc">
            Highest value
          </option>
          <option className="text-black" value="value_asc">
            Lowest value
          </option>
          <option className="text-black" value="sqft_desc">
            Largest square footage
          </option>
          <option className="text-black" value="sqft_asc">
            Smallest square footage
          </option>
        </select>
        <input
          className={baseInputClassName}
          defaultValue={searchParams.minValue}
          name="minValue"
          placeholder="Min value"
          type="number"
        />
        <input
          className={baseInputClassName}
          defaultValue={searchParams.maxValue}
          name="maxValue"
          placeholder="Max value"
          type="number"
        />
        <input
          className={baseInputClassName}
          defaultValue={searchParams.minSqFt}
          name="minSqFt"
          placeholder="Min sq ft"
          type="number"
        />
        <input
          className={baseInputClassName}
          defaultValue={searchParams.maxSqFt}
          name="maxSqFt"
          placeholder="Max sq ft"
          type="number"
        />
        <select
          className={selectClassName}
          defaultValue={searchParams.showJunk ?? "false"}
          name="showJunk"
        >
          <option className="text-black" value="false">
            Hide junk
          </option>
          <option className="text-black" value="true">
            Show junk
          </option>
        </select>
        <input name="view" type="hidden" value={searchParams.view ?? "table"} />
        <div className="flex flex-wrap gap-3 lg:col-span-6">
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
        <div className="flex flex-wrap gap-3 lg:col-span-6">
          <button
            className="rounded-lg bg-[#FF6B00] px-4 py-2 text-sm font-medium text-[#0a0a0a] transition hover:bg-[#FF8C00]"
            type="submit"
          >
            Apply filters
          </button>
          <Link
            className="rounded-lg border border-[#FF6B00]/25 px-4 py-2 text-sm text-[#C0C0C0] transition hover:border-[#FF6B00]"
            href="/dashboard"
          >
            Reset
          </Link>
          <Link
            className="rounded-lg border border-[#FF6B00]/25 px-4 py-2 text-sm text-[#C0C0C0] transition hover:border-[#FF6B00]"
            href={`/dashboard?${new URLSearchParams({
              ...currentParams,
              view: nextView,
            }).toString()}`}
          >
            {nextView === "cards" ? "Card view" : "Table view"}
          </Link>
          <Link
            className="rounded-lg border border-[#FF6B00]/25 px-4 py-2 text-sm text-[#C0C0C0] transition hover:border-[#FF6B00]"
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
          ? "bg-[#FF6B00] text-[#0a0a0a]"
          : "border border-[#FF6B00]/25 text-[#C0C0C0] hover:border-[#FF6B00]"
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
