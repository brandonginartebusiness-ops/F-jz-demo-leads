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
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 rounded-3xl bg-[#1a1a1a] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#C0C0C0]">
              Targeting workspace
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">ICP Builder</h1>
            <p className="mt-3 max-w-2xl text-sm text-[#888888]">
              Build reusable ideal customer profiles for demolition outreach across
              industries, buyer roles, employee ranges, and locations.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">Profiles</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {(data ?? []).length}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
        <DashboardNav
          currentPath="/dashboard/icp"
          showSetupWarning={!companyContext}
        />
      </div>

      <IcpBuilder initialProfiles={(data ?? []) as IcpProfileRecord[]} />
    </main>
  );
}
