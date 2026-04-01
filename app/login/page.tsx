import { LoginForm } from "@/components/auth/login-form";

type Props = {
  searchParams: {
    next?: string;
  };
};

export default function LoginPage({ searchParams }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(201,168,76,0.16),rgba(32,35,59,0.92))] p-8 shadow-2xl shadow-black/30 lg:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[#f2df9e]">
            JZ Demolition
          </p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold text-white lg:text-5xl">
            Commercial demolition leads in one private operating dashboard.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">
            Pull daily Miami-Dade commercial demolition permits, review qualified
            projects, and track outreach from first bookmark to closed lead.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">Sign in</h2>
            <p className="mt-2 text-sm text-white/60">
              Use your shared internal team credentials to access the permit dashboard.
            </p>
          </div>
          <LoginForm redirectTo={searchParams.next || "/dashboard"} />
        </section>
      </div>
    </main>
  );
}
