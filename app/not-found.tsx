import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-[#888888]">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Page not found</h1>
        <p className="mt-3 text-sm text-[#888888]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          className="mt-6 inline-flex rounded-xl bg-[#FF6B00] px-6 py-3 text-sm font-medium text-[#0a0a0a] transition hover:bg-[#FF8C00]"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
