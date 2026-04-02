"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md rounded-3xl border border-red-500/25 bg-[#1a1a1a] p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-3 text-sm text-[#888888]">
          An unexpected error occurred. Please try again.
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
    </main>
  );
}
