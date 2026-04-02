"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-full max-w-md rounded-3xl border border-red-500/25 bg-[#1a1a1a] p-8">
          <h1 className="text-2xl font-semibold text-white">Dashboard error</h1>
          <p className="mt-3 text-sm text-[#888888]">
            Something went wrong loading this page. Please try again.
          </p>
          {error.digest ? (
            <p className="mt-2 font-mono text-xs text-[#666666]">ref: {error.digest}</p>
          ) : null}
          <button
            className="mt-6 rounded-xl bg-[#FF6B00] px-6 py-3 text-sm font-medium text-[#0a0a0a] transition hover:bg-[#FF8C00]"
            onClick={reset}
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
