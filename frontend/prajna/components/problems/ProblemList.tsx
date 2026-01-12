import { ProblemSummary } from "@/types/problems";
import { ProblemCard } from "./ProblemCard";

interface Props {
  problems: ProblemSummary[];
}

export function ProblemList({ problems }: Props) {
  if (!problems.length) {
    return (
      <div className="rounded-2xl border border-white/5 bg-panel p-10 text-center text-white/70">
        No problems found. Seed the backend and refresh.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {problems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} />
      ))}
    </div>
  );
}

