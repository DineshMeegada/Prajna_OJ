'use client';

import { useCompiler } from "./CompilerProvider";

interface Props {
  className?: string;
  variant?: "card" | "overlay";
}

export function IOPanel({ className, variant = "card" }: Props = {}) {
  const {
    input,
    setInput,
    output,
    statusLabel,
    executionTime,
    phase,
    isRunning,
    errorMessage,
  } = useCompiler();

  const baseStyles =
    variant === "overlay"
      ? "rounded-2xl border border-white/10 bg-[#0a0c10]/95 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      : "rounded-3xl border border-white/5 bg-panel p-6 shadow-[var(--shadow-card)]";

  return (
    <div className={`${baseStyles} ${className ?? ""}`}>
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="grid h-full grid-cols-2 gap-4">
          <div className="flex min-h-0 flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Input
            </label>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="flex-1 w-full resize-none rounded-xl border border-white/5 bg-black/30 p-3 font-mono text-sm text-white outline-none transition-colors focus:border-accent/60"
              placeholder="Enter input here..."
            />
          </div>
          <div className="flex min-h-0 flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Output
              </label>
              <div className="flex items-center gap-3">
                {executionTime !== null && (
                  <span className="text-[10px] font-mono text-white/40">
                    {executionTime.toFixed(2)}ms
                  </span>
                )}
                <span
                  className={`text-[10px] uppercase tracking-widest ${phase === "error" ? "text-red-400" : "text-emerald-400/80"
                    }`}
                >
                  {phase === "idle"
                    ? "Ready"
                    : phase === "running"
                      ? "Running..."
                      : statusLabel}
                </span>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              aria-live="polite"
              className={`flex-1 w-full resize-none rounded-xl border border-white/5 bg-black/30 p-3 font-mono text-sm outline-none transition-colors ${errorMessage ? "text-red-300/90" : "text-white"
                } focus:border-accent/60`}
              placeholder={
                isRunning ? "Executing..." : "Output will appear here"
              }
            />
          </div>
        </div>
        {errorMessage && (
          <div className="shrink-0 rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-2">
            <p className="font-mono text-xs text-red-400/90">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
