import { updatePermit } from "@/app/actions";
import { PermitRecord } from "@/lib/types";

type Props = {
  permit: PermitRecord;
};

export function LeadDetailForm({ permit }: Props) {
  return (
    <form action={updatePermit} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6">
      <input name="id" type="hidden" value={permit.id} />

      <div>
        <label className="mb-2 block text-sm font-medium text-white" htmlFor="lead_status">
          Lead status
        </label>
        <select
          className="w-full rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 text-white outline-none transition focus:border-[#c9a84c]"
          defaultValue={permit.lead_status}
          id="lead_status"
          name="lead_status"
        >
          <option value="new">New</option>
          <option value="bookmarked">Bookmarked</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white" htmlFor="notes">
          Notes
        </label>
        <textarea
          className="min-h-40 w-full rounded-xl border border-white/10 bg-[#11111d] px-4 py-3 text-white outline-none transition focus:border-[#c9a84c]"
          defaultValue={permit.notes ?? ""}
          id="notes"
          name="notes"
          placeholder="Add outreach notes, bid timing, and follow-up details."
        />
      </div>

      <button
        className="rounded-xl bg-[#c9a84c] px-4 py-3 font-medium text-[#11111d] transition hover:bg-[#d9b75c]"
        type="submit"
      >
        Save lead details
      </button>
    </form>
  );
}
