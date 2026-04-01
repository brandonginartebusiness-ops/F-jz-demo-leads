import Link from "next/link";

import { DashboardSearchParams } from "@/lib/permits/queries";

type FiltersProps = {
  searchParams: DashboardSearchParams;
};

export function DashboardFilters({ searchParams }: FiltersProps) {
  const baseInputClassName =
    "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-[#c9a84c]";

  const nextView = searchParams.view === "cards" ? "table" : "cards";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <form className="grid gap-4 lg:grid-cols-6">
        <input
          className={`lg:col-span-2 ${baseInputClassName}`}
          defaultValue={searchParams.search}
          name="search"
          placeholder="Search address or contractor"
        />
        <select
          className={baseInputClassName}
          defaultValue={searchParams.leadStatus ?? ""}
          name="leadStatus"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="bookmarked">Bookmarked</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
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
          className={baseInputClassName}
          defaultValue={searchParams.sort ?? "date_desc"}
          name="sort"
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="value_desc">Highest value</option>
          <option value="value_asc">Lowest value</option>
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
            className="rounded-lg bg-[#c9a84c] px-4 py-2 text-sm font-medium text-[#11111d] transition hover:bg-[#d9b75c]"
            type="submit"
          >
            Apply filters
          </button>
          <Link
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#c9a84c]"
            href="/dashboard"
          >
            Reset
          </Link>
          <Link
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#c9a84c]"
            href={`/dashboard?${new URLSearchParams({
              ...Object.fromEntries(
                Object.entries(searchParams).filter(([, value]) => value),
              ),
              view: nextView,
            }).toString()}`}
          >
            {nextView === "cards" ? "Card view" : "Table view"}
          </Link>
          <Link
            className="rounded-lg border border-[#c9a84c]/40 px-4 py-2 text-sm text-[#f2df9e] transition hover:border-[#c9a84c]"
            href={`/api/export?${new URLSearchParams(
              Object.fromEntries(
                Object.entries(searchParams).filter(([, value]) => value),
              ),
            ).toString()}`}
          >
            Export CSV
          </Link>
        </div>
      </form>
    </div>
  );
}
