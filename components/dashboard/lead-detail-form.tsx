import { updatePermit } from "@/app/actions";
import { PermitRecord } from "@/lib/types";

type Props = {
  permit: PermitRecord;
};

export function LeadDetailForm({ permit }: Props) {
  return (
    <form action={updatePermit} className="space-y-5 rounded-2xl border border-[#FF6B00]/25 bg-[#1a1a1a] p-6">
      <input name="id" type="hidden" value={permit.id} />

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
          <option className="text-black" value="closed">
            Closed
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
        className="rounded-xl bg-[#FF6B00] px-4 py-3 font-medium text-[#0a0a0a] transition hover:bg-[#FF8C00]"
        type="submit"
      >
        Save lead details
      </button>
    </form>
  );
}
