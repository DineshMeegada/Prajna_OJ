'use client';

import { useMemo, useState, useEffect } from "react";
import { FaRobot } from "react-icons/fa";
import Editor from "@monaco-editor/react";

import { useCompiler } from "./CompilerProvider";
import { IOPanel } from "./IOPanel";
import { LanguageSelector } from "./LanguageSelector";

const languages = [
  { label: "Python 3", value: "python" },
  { label: "C++ 17", value: "cpp" },
];


interface Props {
  problemUuid?: string;
}

export function CompilerPanel({ problemUuid }: Props) {
  const {
    language,
    setLanguage,
    code,
    setCode,
    runCode,
    isRunning,
    submitCode,
    submissionStatus,
    requestAiReview,
    isReviewing,
    setActiveTab,
  } = useCompiler();
  const [ioVisible, setIoVisible] = useState(false);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + ' -> Run
      if (e.ctrlKey && e.key === "'") {
        e.preventDefault();
        if (!isRunning && submissionStatus !== "Submitting..." && submissionStatus !== "Running") {
          handleRun();
        }
      }
      // Ctrl + Enter -> Submit
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (problemUuid && !isRunning && submissionStatus !== "Submitting..." && submissionStatus !== "Running") {
          handleSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isRunning, submissionStatus, problemUuid]);

  const handleRun = () => {
    setIoVisible(true);
    void runCode();
  };

  const handleSubmit = () => {
    if (!problemUuid) return;
    setIoVisible(true); // Show I/O to see results potentially, or we need a designated area
    void submitCode(problemUuid);
  };

  const handleAiReview = () => {
    if (!problemUuid) return;
    setActiveTab("AI Review");
    void requestAiReview();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any) => {
    editor.onMouseDown(() => {
      setIoVisible(false);
    });
  };

  const editorOptions = useMemo(
    () => ({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on" as const,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      autoIndent: "full" as const,
      smoothScrolling: true,
      formatOnPaste: true,
      formatOnType: true,
      padding: { top: 16, bottom: 16 },
      bracketPairColorization: { enabled: true },
    }),
    []
  );

  const isSubmitting = submissionStatus === "Submitting..." || submissionStatus === "Pending" || submissionStatus === "Running";

  return (
    <div className="flex h-full flex-col rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-panel-dark via-[#0a0c10] to-black p-6 shadow-2xl ring-1 ring-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LanguageSelector
          value={language}
          onChange={setLanguage}
          options={languages}
        />
        <div className="flex gap-2 items-center">
          {submissionStatus !== "Ready" && (
            <span className={`text-sm font-medium ${submissionStatus === "AC" || submissionStatus === "Accepted" ? "text-green-400" :
              submissionStatus === "WA" || submissionStatus === "Wrong Answer" ? "text-red-400" :
                "text-white/60"
              }`}>
              {submissionStatus}
            </span>
          )}

          {problemUuid && (
            <div className="relative group">
              <button
                onClick={handleAiReview}
                disabled={isReviewing || isSubmitting || isRunning}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 border border-white/10 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500 hover:to-purple-500 hover:border-transparent hover:shadow-[0_0_20px_rgba(129,140,248,0.5)]`}
              >
                <FaRobot className={isReviewing ? "animate-spin" : ""} />
                {isReviewing ? "Reviewing..." : "AI Review"}
              </button>
            </div>
          )}

          <div className="relative group">
            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-white transition hover:bg-accent hover:text-black hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRunning ? "Running..." : "Run"}
            </button>
            <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 scale-0 transform rounded-lg bg-black/90 px-3 py-1.5 text-xs font-medium text-white shadow-xl transition-all duration-200 group-hover:scale-100 border border-white/10 whitespace-nowrap z-50">
              <span className="text-accent font-mono">Ctrl + '</span>
              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black/90 border-l border-t border-white/10"></div>
            </div>
          </div>

          {problemUuid && (
            <div className="relative group">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isRunning}
                className={`rounded-full px-6 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${isSubmitting ? "bg-accent/20 text-accent cursor-wait" : "bg-gradient-to-r from-accent to-accent-hover hover:from-white hover:to-white hover:text-black shadow-[0_0_20px_-5px_var(--accent)] hover:shadow-[0_0_25px_var(--accent)]"
                  }`}
              >
                {isSubmitting ? "Judging..." : "Submit"}
              </button>
              <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 scale-0 transform rounded-lg bg-black/90 px-3 py-1.5 text-xs font-medium text-white shadow-xl transition-all duration-200 group-hover:scale-100 border border-white/10 whitespace-nowrap z-50">
                <span className="text-accent font-mono">Ctrl + Enter</span>
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black/90 border-l border-t border-white/10"></div>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="relative mt-6 flex-1 min-h-0 overflow-hidden rounded-[2rem] border border-white/5 bg-[#050505] shadow-inner group">
        <div className="absolute inset-0 pb-12">
          <Editor
            theme="vs-dark"
            language={language === "cpp" ? "cpp" : "python"}
            value={code}
            onChange={(value) => setCode(value ?? "")}
            onMount={handleEditorDidMount}
            options={editorOptions}
            height="100%"
          />
        </div>

        {/* Floating I/O Panel */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 transition-transform duration-300 ease-in-out ${ioVisible ? "translate-y-0" : "translate-y-full"
            }`}
        >
          <IOPanel
            variant="overlay"
            className="h-[22rem] border-b-0"
          />
        </div>

        {/* Floating Toggle Button */}
        <div className="absolute bottom-0 right-6 z-30">
          <button
            onClick={() => setIoVisible((prev) => !prev)}
            className="rounded-full border border-white/10 bg-[#0a0c10]/80 backdrop-blur px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/80 shadow-lg transition hover:border-accent hover:text-accent hover:bg-black"
          >
            {ioVisible ? "Hide I/O" : "Show I/O"}
          </button>
        </div>
      </div>
    </div>
  );
}
