import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: {
    next?: string;
  };
};

function safeRedirectPath(value?: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

export default async function LoginPage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = safeRedirectPath(searchParams.next);

  if (user) {
    redirect(redirectTo);
  }

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16"
    >
      {/* Background: diagonal hazard stripe */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #FF5E00 0px, #FF5E00 2px, transparent 2px, transparent 24px)",
        }}
      />

      {/* Radial glow behind the card */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[120px]" />

      <div className="relative grid w-full max-w-5xl gap-8 animate-enter lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left: hero panel */}
        <section className="relative flex flex-col justify-center overflow-hidden rounded-xl border border-stroke bg-bg-raised p-8 lg:p-12">
          {/* Decorative hazard stripe top */}
          <div
            className="absolute left-0 right-0 top-0 h-1"
            style={{
              background:
                "repeating-linear-gradient(90deg, #FF5E00 0px, #FF5E00 8px, transparent 8px, transparent 14px)",
            }}
          />

          <p className="label-stencil-lg text-accent">JZ Demolition</p>

          <h1 className="mt-5 font-display text-5xl leading-[1.05] text-sand-bright lg:text-6xl xl:text-7xl">
            COMMERCIAL DEMO LEADS.
            <br />
            ONE DASHBOARD.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-sand">
            Pull daily Miami-Dade commercial demolition permits, review qualified
            projects, and track outreach from first bookmark to closed lead.
          </p>

          {/* Decorative stats */}
          <div className="mt-10 flex gap-8 border-t border-stroke pt-6">
            <div>
              <p className="label-stencil">Daily sync</p>
              <p className="mt-1 font-display text-3xl text-accent">4:00 AM ET</p>
            </div>
            <div>
              <p className="label-stencil">Data source</p>
              <p className="mt-1 font-display text-3xl text-sand-bright">MIAMI-DADE</p>
            </div>
          </div>
        </section>

        {/* Right: login form */}
        <section className="relative rounded-xl border border-stroke bg-bg-raised p-8">
          <div
            className="absolute left-0 right-0 top-0 h-1"
            style={{
              background:
                "repeating-linear-gradient(90deg, #A8A29E 0px, #A8A29E 4px, transparent 4px, transparent 10px)",
            }}
          />

          <div className="mb-8">
            <h2 className="font-display text-3xl text-sand-bright">SIGN IN</h2>
            <p className="mt-2 text-sm text-sand">
              Use your shared internal team credentials to access the permit dashboard.
            </p>
          </div>
          <LoginForm redirectTo={redirectTo} />
        </section>
      </div>
    </main>
  );
}
