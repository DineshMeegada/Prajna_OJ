import { DifficultyBadge } from "@/components/problems/DifficultyBadge";
import { ProblemDetail } from "@/types/problems";
import { toDisplayTitle } from "@/lib/formatters";

interface Props {
  problem: ProblemDetail;
}

export function ProblemHeader({ problem }: Props) {
  const formattedTitle = toDisplayTitle(problem.title);
  const idLabel = `#${String(problem.id).padStart(2, "0")}`;

  return (
    <header className="rounded-3xl border border-white/5 bg-panel px-8 py-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {idLabel} {formattedTitle}
        </h1>
        <DifficultyBadge level={problem.difficulty} />
      </div>
      <p className="mt-2 text-sm text-white/60">
        Created {new Date(problem.created_at).toLocaleDateString()}
      </p>
    </header>
  );
}

