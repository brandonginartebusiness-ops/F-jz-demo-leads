import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { IcpBuilder } from "@/components/dashboard/icp-builder";
import { DashboardNav } from "@/components/dashboard/nav";
import { getLatestCompanyContext } from "@/lib/company-context/queries";
import { type IcpProfileRecord } from "@/lib/icp/schema";
import { createClient } from "@/lib/supabase/server";

export default async function IcpPage() {
  const supabase = createClient();
  const companyContext = await getLatestCompanyContext();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/icp");
  }

  const { data, error } = await supabase
    .from("icp_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="hazard-top mb-8 card p-6 animate-enter">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label-stencil text-accent">Targeting workspace</p>
            <h1 className="mt-2 font-display text-4xl text-sand-bright lg:text-5xl">
              ICP BUILDER
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand">
              Build reusable ideal customer profiles for demolition outreach across
              industries, buyer roles, employee ranges, and locations.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="card-accent px-5 py-3">
              <p className="label-stencil">Profiles</p>
              <p className="mt-1 stat-value-sm">{(data ?? []).length}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
        <div className="mt-6 border-t border-stroke pt-4">
          <DashboardNav
            currentPath="/dashboard/icp"
            showSetupWarning={!companyContext}
          />
        </div>
      </header>

      <IcpBuilder initialProfiles={(data ?? []) as IcpProfileRecord[]} />
    </main>
  );
}
