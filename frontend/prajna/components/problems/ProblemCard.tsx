import Link from "next/link";
import { ProblemSummary } from "@/types/problems";
import { DifficultyBadge } from "./DifficultyBadge";
import { toDisplayTitle } from "@/lib/formatters";

interface Props {
  problem: ProblemSummary;
}

export function ProblemCard({ problem }: Props) {
  return (
    <Link
      href={`/problems/${problem.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-panel p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_60px_rgba(0,247,195,0.25)]"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm uppercase text-white/50">
          #{String(problem.id).padStart(2, "0")}
        </p>
        <DifficultyBadge level={problem.difficulty} />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white tracking-tight">
          {toDisplayTitle(problem.title)}
        </h3>
        <p className="mt-2 text-sm text-white/60">
          Created on {new Date(problem.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center justify-between pt-4 text-sm font-medium text-accent">
        View problem
        <span className="text-lg transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}

