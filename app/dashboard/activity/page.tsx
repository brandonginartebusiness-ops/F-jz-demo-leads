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
  searchParams: {
    actionType?: string;
  };
};

const FILTERS: Array<{
  label: string;
  href: string;
  value?: ActivityActionType;
}> = [
  { label: "All activity", href: "/dashboard/activity" },
  {
    label: "Status changes",
    href: "/dashboard/activity?actionType=status_change",
    value: "status_change",
  },
  {
    label: "Notes",
    href: "/dashboard/activity?actionType=note_added",
    value: "note_added",
  },
  {
    label: "New permits",
    href: "/dashboard/activity?actionType=permit_synced",
    value: "permit_synced",
  },
];

export default async function ActivityPage({ searchParams }: Props) {
  const supabase = createClient();
  const companyContext = await getLatestCompanyContext();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/activity");
  }

  const actionType = normalizeActionType(searchParams.actionType);
  const entries = await listActivityFeed(actionType);

  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 rounded-3xl bg-panel p-6 animate-fade-in">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="page-label">
              Activity feed
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">All lead activity</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              Review the latest status updates, notes, and new permit sync events across
              the pipeline.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="stat-card">
              <p className="section-label">Entries</p>
              <p className="mt-1 text-xl font-semibold text-white">{entries.length}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
        <DashboardNav currentPath="/dashboard/activity" showSetupWarning={!companyContext} />
      </div>

      <section className="space-y-5">
        <div className="flex flex-wrap gap-3" role="group" aria-label="Activity type filters">
          {FILTERS.map((filter) => {
            const isActive = actionType === filter.value || (!actionType && !filter.value);

            return (
              <Link
                key={filter.href}
                className={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-accent bg-accent-muted text-accent"
                    : "border-border bg-panel text-silver hover:border-accent"
                }`}
                href={filter.href}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        <ActivityFeedList
          emptyState="No activity matches the current filter yet."
          entries={entries}
        />
      </section>
    </main>
  );
}

function normalizeActionType(value?: string): ActivityActionType | undefined {
  if (
    value === "status_change" ||
    value === "note_added" ||
    value === "permit_synced"
  ) {
    return value;
  }

  return undefined;
}
