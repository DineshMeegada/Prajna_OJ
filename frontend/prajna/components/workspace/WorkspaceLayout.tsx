'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";

import { ProblemDetail } from "@/types/problems";

import { WorkspaceTabs } from "./WorkspaceTabs";
import { CompilerPanel } from "./CompilerPanel";
import { CompilerProvider } from "./CompilerProvider";
import { SubmissionResultManager } from "./SubmissionResultManager";

interface Props {
  problem: ProblemDetail;
}

const MIN_SPLIT = 35;
const MAX_SPLIT = 70;
const INITIAL_SPLIT = 45;

export function WorkspaceLayout({ problem }: Props) {
  const [splitPercent, setSplitPercent] = useState(INITIAL_SPLIT);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const clampSplit = (value: number) =>
    Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, value));

  const startDragging = useCallback(
    (clientX: number) => {
      const containerWidth = containerRef.current?.offsetWidth ?? 1;
      const initial = splitPercent;

      const onMove = (event: MouseEvent | TouchEvent) => {
        const currentX =
          "touches" in event ? event.touches[0]?.clientX ?? clientX : event.clientX;
        const delta = currentX - clientX;
        const deltaPercent = (delta / containerWidth) * 100;
        setSplitPercent(clampSplit(initial + deltaPercent));
      };

      const stop = () => {
        window.removeEventListener("mousemove", onMove as EventListener);
        window.removeEventListener("touchmove", onMove as EventListener);
        window.removeEventListener("mouseup", stop);
        window.removeEventListener("touchend", stop);
      };

      window.addEventListener("mousemove", onMove as EventListener);
      window.addEventListener("touchmove", onMove as EventListener);
      window.addEventListener("mouseup", stop);
      window.addEventListener("touchend", stop);
    },
    [splitPercent]
  );

  const handleMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      startDragging(event.clientX);
    },
    [startDragging]
  );

  const handleTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      if (touch) {
        startDragging(touch.clientX);
      }
    },
    [startDragging]
  );

  const layout = isMobile ? (
    <section className="flex h-full flex-col gap-6 rounded-3xl border border-white/5 bg-panel/80 p-4 shadow-[var(--shadow-card)] overflow-y-auto">
      <div className="rounded-3xl border border-white/5 bg-panel">
        <WorkspaceTabs problem={problem} />
      </div>
      <div className="h-[600px] shrink-0">
        <CompilerPanel problemUuid={problem.uuid} />
      </div>
    </section>
  ) : (
    <section className="h-full rounded-3xl border border-white/5 bg-panel/70 p-4 shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex h-full gap-4" ref={containerRef}>
        <div
          className="flex-1 min-h-0 overflow-hidden"
          style={{
            flexBasis: `calc(${splitPercent}% - 12px)`,
            maxWidth: `calc(${splitPercent}% - 12px)`,
          }}
        >
          <WorkspaceTabs problem={problem} />
        </div>

        <div
          role="separator"
          aria-label="Resize workspace panels"
          className="group relative flex h-auto w-1 cursor-col-resize items-center justify-center rounded-full bg-white/10 transition hover:bg-accent hover:shadow-[0_0_15px_var(--accent)]"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="absolute flex h-8 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="h-1 w-0.5 rounded-full bg-black/50" />
            <div className="h-1 w-0.5 rounded-full bg-black/50" />
            <div className="h-1 w-0.5 rounded-full bg-black/50" />
          </div>
        </div>

        <div
          className="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden"
          style={{
            flexBasis: `calc(${100 - splitPercent}% - 12px)`,
            maxWidth: `calc(${100 - splitPercent}% - 12px)`,
          }}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <CompilerPanel problemUuid={problem.uuid} />
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <CompilerProvider problemUuid={problem.uuid}>
      {layout}
      <SubmissionResultManager />
    </CompilerProvider>
  );
}

