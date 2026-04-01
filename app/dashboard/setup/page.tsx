import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardNav } from "@/components/dashboard/nav";
import { CompanySetupForm } from "@/components/dashboard/company-setup-form";
import { type CompanyContextRecord } from "@/lib/company-context/schema";
import { getLatestCompanyContext } from "@/lib/company-context/queries";
import { createClient } from "@/lib/supabase/server";

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function SetupPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/setup");
  }

  const companyContext = (await getLatestCompanyContext()) as CompanyContextRecord | null;
  const lastUpdated = formatUpdatedAt(companyContext?.updated_at ?? null);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#C0C0C0]">
              Company setup
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Configure outreach context
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[#888888]">
              Capture your service areas, positioning, project sizes, and voice so the
              rest of the lead workflow has the right context.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#888888]">Status</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {companyContext ? "Configured" : "Needs setup"}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
        <DashboardNav
          currentPath="/dashboard/setup"
          showSetupWarning={!companyContext}
        />
      </div>

      {lastUpdated ? (
        <div className="mb-6 rounded-2xl border border-[#FF6B00]/25 bg-[#FF6B00]/10 px-4 py-3 text-sm text-[#C0C0C0]">
          Last updated {lastUpdated}
        </div>
      ) : null}

      <CompanySetupForm initialData={companyContext} />
    </main>
  );
}
