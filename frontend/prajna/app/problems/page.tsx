import Link from "next/link";
import { fetchProblems } from "@/lib/api";
import { PageIntro } from "@/components/common/PageIntro";
import { ProblemList } from "@/components/problems/ProblemList";

export const dynamic = "force-dynamic";

export default async function ProblemsPage() {
  const problems = await fetchProblems();

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <PageIntro
        eyebrow="Problem Sets"
        title="Sharpen your problem-solving edge."
        description="Filterless view of every open problem in the judge. Pick a challenge, open the integrated workspace, and iterate fast."
        actions={
          <Link
            href="/compiler"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-accent hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            Quick compiler
          </Link>
        }
      />
      <ProblemList problems={problems} />
    </div>
  );
}

