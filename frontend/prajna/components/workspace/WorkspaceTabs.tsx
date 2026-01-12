import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useCompiler } from './CompilerProvider';

import { DifficultyBadge } from "@/components/problems/DifficultyBadge";
import { toDisplayTitle } from "@/lib/formatters";
import { ProblemDetail } from "@/types/problems";
import { StatementRenderer } from "./StatementRenderer";
import { SubmissionsList } from "./SubmissionsList";

const tabs = ["Description", "Solution", "Submissions", "AI Review"] as const;

interface Props {
  problem: ProblemDetail;
}

export function WorkspaceTabs({ problem }: Props) {
  // Remove local state active, setActive
  const [formattedDate, setFormattedDate] = useState("");
  const { aiReviewResult, isReviewing, activeTab, setActiveTab, remainingAiReviews } = useCompiler();

  // Switch to AI Review tab if a new review comes in? 
  // Maybe better to let user switch. But user requested "Show the response...".
  // I'll add an effect to switch if aiReviewResult changes and is not empty?
  // But that might annoy user if they are checking description.
  // I'll leave it manual for now, or auto-switch if user clicked the button (which is in another component).
  // Ideally, when button clicked, we might want to switch tab.
  // But state is local to this component. Context doesn't have "activeTab".

  // Let's just implement the tab content first.

  useEffect(() => {
    setFormattedDate(new Date(problem.created_at).toLocaleDateString());
  }, [problem.created_at]);

  // If aiReviewResult updates and isReviewing becomes false (finished), maybe switch?
  // "isReviewing" is in context. 
  // Let's add a refined UX: When review finishes, user might want to see it.

  const renderDescription = () => {
    const formattedTitle = toDisplayTitle(problem.title);
    const idLabel = `#${String(problem.id).padStart(2, "0")}`;

    return (
      <>
        <div className="mb-6 rounded-2xl border border-white/10 bg-black/30 px-6 py-5 shadow-[0_15px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-wrap items-center gap-3 text-white">
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/60">
              {idLabel}
            </span>
            <h1 className="text-xl font-semibold text-white">{formattedTitle}</h1>
            <DifficultyBadge level={problem.difficulty} />
          </div>
          <p className="mt-2 text-xs uppercase tracking-widest text-white/50">
            Created {formattedDate}
          </p>
        </div>
        <StatementRenderer statement={problem.statement} />
      </>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Description":
        return renderDescription();
      case "Solution":
        return (
          <p className="text-white/70">
            Share your thought process and optimal approaches here. You can
            extend this tab later to show editorial snippets or your saved
            notes.
          </p>
        );
      case "Submissions":
        return <SubmissionsList problemUuid={problem.uuid} />;
      case "AI Review":
        return (
          <div className="prose prose-invert max-w-none text-white/90">
            {/* Header with Remaining Requests */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent m-0">
                AI Code Review
              </h2>
              {remainingAiReviews !== null && (
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  {remainingAiReviews} requests remaining today
                </div>
              )}
            </div>

            {isReviewing ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="animate-spin text-4xl text-indigo-400">⚡</div>
                <p className="text-indigo-200 animate-pulse">Analyzing your code...</p>
              </div>
            ) : aiReviewResult ? (
              <div className="space-y-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-indigo-300 mt-6 mb-2 border-b border-white/10 pb-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 text-white/80" {...props} />,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
                    code: ({ node, className, ...props }: any) => {
                      return <code className="bg-white/10 rounded px-1 py-0.5 text-sm font-mono text-yellow-200" {...props} />
                    }
                  }}
                >
                  {aiReviewResult}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-white/40">
                <div className="text-4xl grayscale opacity-50">🤖</div>
                <p>Request an AI review to get feedback on your code.</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/5 bg-panel shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap gap-3 border-b border-white/5 px-6 py-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab
                ? tab === "AI Review"
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 ring-1 ring-indigo-500/50" // Highlight for AI Review active
                  : "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
              } ${tab === "AI Review" && activeTab !== "AI Review" ? "hover:text-indigo-300" : ""
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto px-6 py-6 text-sm leading-relaxed text-white/70">
        {renderContent()}
      </div>
    </div>
  );
}

