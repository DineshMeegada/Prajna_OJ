import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchProblemDetail } from "@/lib/api";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProblemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const problem = await fetchProblemDetail(id).catch(() => null);

  if (!problem) {
    notFound();
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex-none px-6 py-4">
        <Link
          href="/problems"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-accent"
        >
          ← Back to list
        </Link>
      </div>

      <div className="flex-1 min-h-0 px-6 pb-4">
        <WorkspaceLayout problem={problem} />
      </div>
    </div>
  );
}

