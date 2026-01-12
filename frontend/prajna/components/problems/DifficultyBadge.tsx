import { Difficulty } from "@/types/problems";

const palette: Record<string, string> = {
  easy: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
  medium: "text-amber-200 bg-amber-500/10 border-amber-400/40",
  hard: "text-rose-200 bg-rose-500/10 border-rose-400/40",
};

interface Props {
  level: Difficulty;
}

export function DifficultyBadge({ level }: Props) {
  const key = level?.toLowerCase();
  const tone = palette[key as keyof typeof palette] ?? palette.medium;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-wider ${tone}`}
    >
      {level}
    </span>
  );
}

