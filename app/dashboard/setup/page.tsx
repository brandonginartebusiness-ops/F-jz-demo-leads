import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardNav } from "@/components/dashboard/nav";
import { CompanySetupForm } from "@/components/dashboard/company-setup-form";
import { type CompanyContextRecord } from "@/lib/company-context/schema";
import { getLatestCompanyContext } from "@/lib/company-context/queries";
import { createClient } from "@/lib/supabase/server";

function formatUpdatedAt(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function SetupPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/setup");

  const companyContext = (await getLatestCompanyContext()) as CompanyContextRecord | null;
  const lastUpdated = formatUpdatedAt(companyContext?.updated_at ?? null);

  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="hazard-top mb-8 card p-6 animate-enter">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="label-stencil text-accent">Company Setup</p>
            <h1 className="mt-2 font-display text-4xl text-sand-bright lg:text-5xl">
              OUTREACH CONTEXT
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand">
              Capture your service areas, positioning, project sizes, and voice so
              the rest of the lead workflow has the right context.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="card-accent px-5 py-3">
              <p className="label-stencil">Status</p>
              <p className="mt-1 font-display text-2xl text-sand-bright">
                {companyContext ? "CONFIGURED" : "NEEDS SETUP"}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
        <div className="mt-6 border-t border-stroke pt-4">
          <DashboardNav currentPath="/dashboard/setup" showSetupWarning={!companyContext} />
        </div>
      </header>

      {lastUpdated ? (
        <div className="mb-6 card-accent px-4 py-3 text-sm text-sand">
          Last updated {lastUpdated}
        </div>
      ) : null}

      <CompanySetupForm initialData={companyContext} />
    </main>
  );
}
