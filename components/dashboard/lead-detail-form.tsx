"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { PermitRecord } from "@/lib/types";

type Props = {
  permit: PermitRecord;
};

export function LeadDetailForm({ permit }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      lead_status: String(formData.get("lead_status") ?? "new"),
      notes: String(formData.get("notes") ?? ""),
    };

    try {
      const response = await fetch(`/api/permits/${permit.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(result?.error ?? "Failed to save lead details.");
      }

      setSuccessMessage("Lead details saved.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save lead details.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="space-y-5 rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-white" htmlFor="lead_status">
          Lead status
        </label>
        <select
          className="w-full rounded-xl border border-[#FF6B00]/25 bg-[#1a1a1a] px-4 py-3 text-white outline-none transition focus:border-[#FF6B00]"
          defaultValue={permit.lead_status}
          id="lead_status"
          name="lead_status"
        >
          <option className="text-black" value="new">
            New
          </option>
          <option className="text-black" value="bookmarked">
            Bookmarked
          </option>
          <option className="text-black" value="contacted">
            Contacted
          </option>
          <option className="text-black" value="in_progress">
            In progress
          </option>
          <option className="text-black" value="closed_won">
            Closed won
          </option>
          <option className="text-black" value="closed_lost">
            Closed lost
          </option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white" htmlFor="notes">
          Notes
        </label>
        <textarea
          className="min-h-40 w-full rounded-xl border border-[#FF6B00]/25 bg-[#1a1a1a] px-4 py-3 text-white outline-none transition focus:border-[#FF6B00]"
          defaultValue={permit.notes ?? ""}
          id="notes"
          name="notes"
          placeholder="Add outreach notes, bid timing, and follow-up details."
        />
      </div>

      <button
        className="rounded-xl bg-[#FF6B00] px-4 py-3 font-medium text-[#0a0a0a] transition hover:bg-[#FF8C00] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSaving}
        type="submit"
      >
        {isSaving ? "Saving..." : "Save lead details"}
      </button>

      {error ? <p className="text-sm text-[#ff8a80]">{error}</p> : null}
      {successMessage ? <p className="text-sm text-[#C0C0C0]">{successMessage}</p> : null}
    </form>
  );
}
