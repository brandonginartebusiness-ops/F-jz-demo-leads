import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { IcpBuilder } from "@/components/dashboard/icp-builder";
import { type IcpProfileRecord } from "@/lib/icp/schema";
import { createClient } from "@/lib/supabase/server";

export default async function IcpPage() {
  const supabase = createClient();
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
      <div className="mb-6">
        <Link className="text-sm text-[#f2df9e] hover:text-white" href="/dashboard">
          Back to dashboard
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#f2df9e]">
            Targeting workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">ICP Builder</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/65">
            Build reusable ideal customer profiles for demolition outreach across
            industries, buyer roles, employee ranges, and locations.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#11111d] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Profiles</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {(data ?? []).length}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>

      <IcpBuilder initialProfiles={(data ?? []) as IcpProfileRecord[]} />
    </main>
  );
}
