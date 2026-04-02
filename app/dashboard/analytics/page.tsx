import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardNav } from "@/components/dashboard/nav";
import { getLatestCompanyContext } from "@/lib/company-context/queries";
import { createClient } from "@/lib/supabase/server";

const AnalyticsDashboard = dynamic(
  () => import("@/components/dashboard/analytics-dashboard").then((m) => m.AnalyticsDashboard),
  { ssr: false },
);

export default async function AnalyticsPage() {
  const supabase = createClient();
  const companyContext = await getLatestCompanyContext();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/analytics");

  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="hazard-top mb-8 card p-6 animate-enter">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label-stencil text-accent">Performance Analytics</p>
            <h1 className="mt-2 font-display text-4xl text-sand-bright lg:text-5xl">
              PIPELINE ANALYTICS
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand">
              Track permit volume, contractor activity, lead progression, and area trends.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="card-accent px-5 py-3">
              <p className="label-stencil">Status</p>
              <p className="mt-1 font-display text-2xl text-teal">LIVE</p>
            </div>
            <SignOutButton />
          </div>
        </div>
        <div className="mt-6 border-t border-stroke pt-4">
          <DashboardNav currentPath="/dashboard/analytics" showSetupWarning={!companyContext} />
        </div>
      </header>

      <AnalyticsDashboard />
    </main>
  );
}
