import { useState } from "react";
import LeftSidebar     from "../components/sidebar/LeftSidebar";
import RightSidebar    from "../components/sidebar/RightSidebar";
import FlowCanvas      from "../components/canvas/FlowCanvas";
import SimulationPanel from "../components/sandbox/SimulationPanel";
import { useWorkflowStore } from "../store/useWorkflowStore";

// ─── Top bar ──────────────────────────────────────────────────────────────────

function TopBar({ onSimulate, isSimulating }: {
  onSimulate: () => void;
  isSimulating: boolean;
}) {
  return (
    <header className="flex items-center justify-between px-5 h-12 border-b border-neutral-100 bg-white shrink-0 z-10">
      {/* Left: undo/redo placeholders */}
      <div className="flex items-center gap-1.5 w-40">
        {["←", "→"].map((icon) => (
          <button
            key={icon}
            className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 transition-colors text-sm"
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Center: workflow title */}
      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold text-neutral-800">Agent Workflow</span>
        <span className="text-[10px] text-neutral-400">Overview of Agent Nodes</span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 w-40 justify-end">
        <button
          onClick={onSimulate}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            transition-all duration-150
            ${isSimulating
              ? "bg-neutral-900 text-white shadow-sm"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-white"
            }
          `}
        >
          <span className="text-[10px]">▷</span>
          Simulate
        </button>

        {["◻", "ⓘ"].map((icon) => (
          <button
            key={icon}
            className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 transition-colors text-sm"
          >
            {icon}
          </button>
        ))}
      </div>
    </header>
  );
}

// ─── Canvas status bar ────────────────────────────────────────────────────────

function StatusBar() {
  const nodeCount = useWorkflowStore((s) => s.nodes.length);
  const edgeCount = useWorkflowStore((s) => s.edges.length);

  return (
    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-neutral-100 rounded-lg px-2.5 py-1 shadow-sm">
        <span className="text-[10px] text-neutral-400">
          {nodeCount} node{nodeCount !== 1 ? "s" : ""}
        </span>
        <span className="w-px h-3 bg-neutral-200" />
        <span className="text-[10px] text-neutral-400">
          {edgeCount} edge{edgeCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function App() {
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-50 font-sans overflow-hidden">
      <TopBar
        onSimulate={() => setIsSimulationOpen((v) => !v)}
        isSimulating={isSimulationOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />

        <main className="flex-1 relative">
          <FlowCanvas />
          <StatusBar />
        </main>

        <RightSidebar />
      </div>

      {/* Simulation drawer — rendered at root level so it overlays everything */}
      <SimulationPanel
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
      />
    </div>
  );
}