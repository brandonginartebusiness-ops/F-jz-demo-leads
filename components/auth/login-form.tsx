"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Props = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo = "/dashboard" }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white" htmlFor="email">
          Email
        </label>
        <input
          className="input-base"
          id="email"
          name="email"
          placeholder="team@jzdemolition.com"
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white" htmlFor="password">
          Password
        </label>
        <input
          className="input-base"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      {error ? (
        <p
          aria-live="polite"
          className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          id="login-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        className="btn-primary w-full"
        disabled={loading}
        type="submit"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
