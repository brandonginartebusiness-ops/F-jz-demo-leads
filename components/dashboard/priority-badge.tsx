import { getPriorityLabel } from "@/lib/scoring/calculate-priority";

type Props = {
  score: number | null;
};

export function PriorityBadge({ score }: Props) {
  const normalizedScore = score ?? 0;
  const normalizedLabel = getPriorityLabel(normalizedScore);
  const styles =
    normalizedLabel === "Hot"
      ? "bg-[#FF6B00]/15 text-[#FF6B00]"
      : normalizedLabel === "Warm"
        ? "bg-[#FFB347]/15 text-[#FFB347]"
        : "bg-[#888888]/15 text-[#C0C0C0]";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${styles}`}>
      <span>{normalizedLabel}</span>
      <span>{normalizedScore}</span>
    </span>
  );
}
