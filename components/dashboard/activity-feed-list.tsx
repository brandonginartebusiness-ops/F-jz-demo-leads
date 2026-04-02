import Link from "next/link";

import { ActivityFeedRecord } from "@/lib/types";

type Props = {
  entries: ActivityFeedRecord[];
  emptyState: string;
};

export function ActivityFeedList({ entries, emptyState }: Props) {
  if (entries.length === 0) {
    return (
      <div className="panel border-dashed p-6 text-sm text-muted">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="panel p-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-label">
                {formatTimeAgo(entry.created_at)}
              </p>
              <div className="mt-2">
                {entry.permit_id ? (
                  <Link
                    className="text-base font-semibold text-white transition hover:text-accent"
                    href={`/dashboard/${entry.permit_id}`}
                  >
                    {entry.permit_address || "Unknown address"}
                  </Link>
                ) : (
                  <p className="text-base font-semibold text-white">
                    {entry.permit_address || "Unknown address"}
                  </p>
                )}
              </div>
            </div>
            <span className="inline-flex rounded-full bg-accent-muted px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-accent">
              {formatActionLabel(entry.action_type)}
            </span>
          </div>

          <p className="mt-3 text-sm text-silver">{describeActivity(entry)}</p>

          {entry.note ? (
            <div className="mt-3 rounded-xl border border-accent/20 bg-panel-soft px-4 py-3 text-sm text-white/80">
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
    return `Lead status changed from ${formatValue(entry.old_value)} to ${formatValue(entry.new_value)}.`;
  }

  if (entry.action_type === "note_added") {
    return entry.old_value
      ? "Lead notes were updated."
      : "A note was added to this lead.";
  }

  if (entry.action_type === "permit_synced") {
    return "A new permit was synced into the dashboard.";
  }

  return "Activity recorded.";
}

function formatActionLabel(actionType: ActivityFeedRecord["action_type"]) {
  switch (actionType) {
    case "status_change":
      return "Status change";
    case "note_added":
      return "Note saved";
    case "permit_synced":
      return "New permit";
    default:
      return "Activity";
  }
}

function formatValue(value: string | null) {
  if (!value) {
    return "empty";
  }

  return value.replaceAll("_", " ");
}

function formatTimeAgo(value: string | null) {
  if (!value) {
    return "Unknown time";
  }

  const timestamp = new Date(value).getTime();
  const diffInSeconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
