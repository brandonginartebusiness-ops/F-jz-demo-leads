"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { LeadTypeBadge } from "@/components/dashboard/lead-type-badge";
import { PriorityBadge } from "@/components/dashboard/priority-badge";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Failed to save lead details.");
      }

      setSuccessMessage("Lead details saved.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to save lead details.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="label-stencil mb-2">Lead type</p>
          <LeadTypeBadge leadType={permit.lead_type} />
        </div>
        <div>
          <p className="label-stencil mb-2">Priority</p>
          <PriorityBadge score={permit.priority_score} />
        </div>
      </div>

      <div>
        <label className="label-stencil mb-2 block" htmlFor="lead_status">
          Status
        </label>
        <select
          className="input"
          defaultValue={permit.lead_status}
          id="lead_status"
          name="lead_status"
        >
          <option value="new">New</option>
          <option value="bookmarked">Bookmarked</option>
          <option value="contacted">Contacted</option>
          <option value="in_progress">In progress</option>
          <option value="closed_won">Closed won</option>
          <option value="closed_lost">Closed lost</option>
        </select>
      </div>

      <div>
        <label className="label-stencil mb-2 block" htmlFor="notes">
          Notes
        </label>
        <textarea
          className="input min-h-40"
          defaultValue={permit.notes ?? ""}
          id="notes"
          name="notes"
          placeholder="Add outreach notes, bid timing, follow-up details..."
        />
      </div>

      <button className="btn-accent" disabled={isSaving} type="submit">
        {isSaving ? "SAVING..." : "SAVE LEAD DETAILS"}
      </button>

      {error ? (
        <p aria-live="polite" className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {successMessage ? (
        <p aria-live="polite" className="rounded border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-teal">
          {successMessage}
        </p>
      ) : null}
    </form>
  );
}
