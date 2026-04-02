import Link from "next/link";

import { ActivityFeedRecord } from "@/lib/types";

type Props = {
  entries: ActivityFeedRecord[];
  emptyState: string;
};

export function ActivityFeedList({ entries, emptyState }: Props) {
  if (entries.length === 0) {
    return (
      <div className="card border-dashed p-6 text-center text-sm text-sand/50">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <article key={entry.id} className="card p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[11px] text-sand/50">
                {formatTimeAgo(entry.created_at)}
              </p>
              <div className="mt-1.5">
                {entry.permit_id ? (
                  <Link
                    className="text-sm font-semibold text-sand-bright transition-colors hover:text-accent"
                    href={`/dashboard/${entry.permit_id}`}
                  >
                    {entry.permit_address || "Unknown address"}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-sand-bright">
                    {entry.permit_address || "Unknown address"}
                  </p>
                )}
              </div>
            </div>
            <span className={`inline-flex rounded border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-stencil ${
              entry.action_type === "status_change"
                ? "border-accent/30 bg-accent/10 text-accent"
                : entry.action_type === "permit_synced"
                  ? "border-teal/30 bg-teal/10 text-teal"
                  : "border-stroke bg-bg-soft text-sand"
            }`}>
              {formatActionLabel(entry.action_type)}
            </span>
          </div>

          <p className="mt-2 text-sm text-sand">{describeActivity(entry)}</p>

          {entry.note ? (
            <div className="mt-2 rounded border border-stroke bg-bg-soft px-3 py-2 text-sm text-sand-light">
              {entry.note}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function describeActivity(entry: ActivityFeedRecord) {
  if (entry.action_type === "status_change") {
    return `Status changed from ${formatValue(entry.old_value)} to ${formatValue(entry.new_value)}.`;
  }
  if (entry.action_type === "note_added") {
    return entry.old_value ? "Lead notes updated." : "Note added to this lead.";
  }
  if (entry.action_type === "permit_synced") {
    return "New permit synced into the dashboard.";
  }
  return "Activity recorded.";
}

function formatActionLabel(actionType: ActivityFeedRecord["action_type"]) {
  switch (actionType) {
    case "status_change": return "Status";
    case "note_added": return "Note";
    case "permit_synced": return "New Permit";
    default: return "Activity";
  }
}

function formatValue(value: string | null) {
  if (!value) return "empty";
  return value.replaceAll("_", " ");
}

function formatTimeAgo(value: string | null) {
  if (!value) return "Unknown time";
  const timestamp = new Date(value).getTime();
  const diffInSeconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}
