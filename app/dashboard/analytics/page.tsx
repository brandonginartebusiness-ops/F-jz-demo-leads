import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardNav } from "@/components/dashboard/nav";
import { getLatestCompanyContext } from "@/lib/company-context/queries";
import { createClient } from "@/lib/supabase/server";

const AnalyticsDashboard = dynamic(
  () =>
    import("@/components/dashboard/analytics-dashboard").then(
      (m) => m.AnalyticsDashboard,
    ),
  { ssr: false },
);

export default async function AnalyticsPage() {
  const supabase = createClient();
  const companyContext = await getLatestCompanyContext();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/analytics");
  }

  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 rounded-3xl bg-panel p-6 animate-fade-in">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="page-label">
              Performance analytics
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Demolition pipeline analytics
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              Track permit volume, contractor activity, lead progression, and area
              trends from the live permits dataset.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="stat-card">
              <p className="section-label">Analytics</p>
              <p className="mt-1 text-xl font-semibold text-white">Live</p>
            </div>
            <SignOutButton />
          </div>
        </div>
        <DashboardNav
          currentPath="/dashboard/analytics"
          showSetupWarning={!companyContext}
        />
      </div>

      <AnalyticsDashboard />
    </main>
  );
}
