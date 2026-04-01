import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { CompanySetupForm } from "@/components/dashboard/company-setup-form";
import { type CompanyContextRecord } from "@/lib/company-context/schema";
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

  const { data, error } = await supabase
    .from("company_context")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const companyContext = (data ?? null) as CompanyContextRecord | null;
  const lastUpdated = formatUpdatedAt(companyContext?.updated_at ?? null);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link className="text-sm text-[#f2df9e] hover:text-white" href="/dashboard">
          Back to dashboard
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#f2df9e]">
            Company setup
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Configure outreach context
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/65">
            Capture your service areas, positioning, project sizes, and voice so the
            rest of the lead workflow has the right context.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#11111d] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Status</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {companyContext ? "Configured" : "Needs setup"}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>

      {lastUpdated ? (
        <div className="mb-6 rounded-2xl border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-4 py-3 text-sm text-[#f2df9e]">
          Last updated {lastUpdated}
        </div>
      ) : null}

      <CompanySetupForm initialData={companyContext} />
    </main>
  );
}
