import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { ActivityFeedList } from "@/components/dashboard/activity-feed-list";
import { DashboardNav } from "@/components/dashboard/nav";
import { getLatestCompanyContext } from "@/lib/company-context/queries";
import { listActivityFeed } from "@/lib/activity-feed/queries";
import { createClient } from "@/lib/supabase/server";
import { ActivityActionType } from "@/lib/types";

type Props = {
  searchParams: { actionType?: string };
};

const FILTERS: Array<{ label: string; href: string; value?: ActivityActionType }> = [
  { label: "All", href: "/dashboard/activity" },
  { label: "Status", href: "/dashboard/activity?actionType=status_change", value: "status_change" },
  { label: "Notes", href: "/dashboard/activity?actionType=note_added", value: "note_added" },
  { label: "New Permits", href: "/dashboard/activity?actionType=permit_synced", value: "permit_synced" },
];

export default async function ActivityPage({ searchParams }: Props) {
  const supabase = createClient();
  const companyContext = await getLatestCompanyContext();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/activity");

  const actionType = normalizeActionType(searchParams.actionType);
  const entries = await listActivityFeed(actionType);

  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="hazard-top mb-8 card p-6 animate-enter">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label-stencil text-accent">Activity Feed</p>
            <h1 className="mt-2 font-display text-4xl text-sand-bright lg:text-5xl">
              ALL LEAD ACTIVITY
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand">
              Review status updates, notes, and new permit sync events across the pipeline.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="card-accent px-5 py-3">
              <p className="label-stencil">Entries</p>
              <p className="mt-1 stat-value-sm">{entries.length}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
        <div className="mt-6 border-t border-stroke pt-4">
          <DashboardNav currentPath="/dashboard/activity" showSetupWarning={!companyContext} />
        </div>
      </header>

      <section className="space-y-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Activity type filters">
          {FILTERS.map((filter) => {
            const isActive = actionType === filter.value || (!actionType && !filter.value);
            return (
              <Link
                key={filter.href}
                className={`rounded px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-accent text-white shadow-md shadow-accent/20"
                    : "border border-stroke text-sand hover:border-sand/30 hover:text-sand-bright"
                }`}
                href={filter.href}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        <ActivityFeedList emptyState="No activity matches the current filter yet." entries={entries} />
      </section>
    </main>
  );
}

function normalizeActionType(value?: string): ActivityActionType | undefined {
  if (value === "status_change" || value === "note_added" || value === "permit_synced") return value;
  return undefined;
}
