import { CompilerPanel } from "@/components/workspace/CompilerPanel";
import { CompilerProvider } from "@/components/workspace/CompilerProvider";

export default function CompilerPage() {
  return (
    <CompilerProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-black">
        <div className="flex-none px-6 py-3 border-b border-white/5 bg-panel-dark/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-white tracking-tight">
                Playground
              </h1>
              <div className="h-4 w-px bg-white/10" />
              <p className="text-sm text-white/50">
                Standalone compiler for quick experiments
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 px-6 py-4">
          <CompilerPanel />
        </div>
      </div>
    </CompilerProvider>
  );
}

