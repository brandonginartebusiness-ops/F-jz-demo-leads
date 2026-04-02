import { getPriorityLabel } from "@/lib/scoring/calculate-priority";

type Props = {
  score: number | null;
};

export function PriorityBadge({ score }: Props) {
  const normalizedScore = score ?? 0;
  const normalizedLabel = getPriorityLabel(normalizedScore);
  const styles =
    normalizedLabel === "Hot"
      ? "bg-accent/15 text-accent border-accent/30"
      : normalizedLabel === "Warm"
        ? "bg-amber/15 text-amber border-amber/30"
        : "bg-bg-soft text-sand border-stroke";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold tracking-wide ${styles}`}>
      <span>{normalizedLabel}</span>
      <span className="font-mono text-[10px] opacity-70">{normalizedScore}</span>
    </span>
  );
}
