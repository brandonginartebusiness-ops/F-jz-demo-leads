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
        <input name="view" type="hidden" value={searchParams.view ?? "table"} />
        <div className="flex gap-3 lg:col-span-6">
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
