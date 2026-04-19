import { useState, useCallback } from "react";
import { useWorkflowStore } from "../../store/useWorkflowStore";
import { simulateWorkflow, type SimulationLog } from "../../services/api";

// ─── Timeline entry ───────────────────────────────────────────────────────────

const STATUS_STYLES = {
  success: {
    dot:  "bg-emerald-400 ring-4 ring-emerald-100",
    text: "text-emerald-700",
    badge:"bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: "✓",
  },
  pending: {
    dot:  "bg-amber-400 ring-4 ring-amber-100",
    text: "text-amber-700",
    badge:"bg-amber-50 text-amber-600 border-amber-100",
    icon: "◌",
  },
  error: {
    dot:  "bg-rose-400 ring-4 ring-rose-100",
    text: "text-rose-700",
    badge:"bg-rose-50 text-rose-600 border-rose-100",
    icon: "✕",
  },
} as const;

function TimelineEntry({
  log,
  isLast,
}: {
  log: SimulationLog;
  isLast: boolean;
}) {
  const s = STATUS_STYLES[log.status];

  return (
    <div className="flex gap-3">
      {/* Spine */}
      <div className="flex flex-col items-center">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${s.dot}`} />
        {!isLast && <span className="w-px flex-1 bg-neutral-100 my-1" />}
      </div>

      {/* Content */}
      <div className={`pb-4 min-w-0 ${isLast ? "" : ""}`}>
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[10px] font-mono text-neutral-400">
            Step {log.step}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${s.badge}`}
          >
            <span>{s.icon}</span>
            {log.status}
          </span>
          <span className="text-[10px] font-semibold text-neutral-700 truncate">
            {log.nodeLabel}
          </span>
        </div>
        <p className={`text-[11px] leading-relaxed ${s.text}`}>
          {log.message}
        </p>
        {log.nodeId && (
          <p className="text-[10px] font-mono text-neutral-300 mt-0.5 truncate">
            {log.nodeId}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton loader — shown while the API call is in-flight ─────────────────

function TimelineSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-200 shrink-0 mt-0.5" />
            {i < 3 && <span className="w-px h-10 bg-neutral-100 my-1" />}
          </div>
          <div className="pb-4 flex-1 space-y-1.5">
            <div className="flex gap-2">
              <div className="h-3 w-10 rounded bg-neutral-100" />
              <div className="h-3 w-16 rounded bg-neutral-100" />
              <div className="h-3 w-20 rounded bg-neutral-100" />
            </div>
            <div className="h-3 w-full rounded bg-neutral-100" />
            <div className="h-3 w-3/4 rounded bg-neutral-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Validation summary badge ─────────────────────────────────────────────────

function ValidationError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2.5">
      <span className="mt-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-rose-100 text-rose-600 text-[10px] shrink-0">
        ✕
      </span>
      <p className="text-xs text-rose-700 leading-relaxed">{message}</p>
    </div>
  );
}

// ─── Result summary bar ───────────────────────────────────────────────────────

function ResultSummary({
  logs,
  elapsed,
}: {
  logs: SimulationLog[];
  elapsed: number;
}) {
  const errors  = logs.filter((l) => l.status === "error").length;
  const success = logs.filter((l) => l.status === "success").length;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-neutral-50 border border-neutral-100 px-3 py-2.5 mb-4">
      <div className="flex-1 space-y-0.5">
        <p className="text-[10px] font-semibold text-neutral-700">
          Simulation complete
        </p>
        <p className="text-[10px] text-neutral-400">
          {success} passed · {errors} issue{errors !== 1 ? "s" : ""} · {elapsed}ms
        </p>
      </div>
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          errors > 0
            ? "bg-rose-50 text-rose-600 border-rose-100"
            : "bg-emerald-50 text-emerald-600 border-emerald-100"
        }`}
      >
        {errors > 0 ? "Issues found" : "All clear"}
      </span>
    </div>
  );
}

// ─── Panel root ───────────────────────────────────────────────────────────────

interface SimulationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SimulationPanel({ isOpen, onClose }: SimulationPanelProps) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);

  const [logs,    setLogs]    = useState<SimulationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [hasRun,  setHasRun]  = useState(false);

  const handleRun = useCallback(async () => {
    setError(null);
    setLogs([]);
    setElapsed(null);

    // Client-side validation — must have exactly one Start node
    const startNodes = nodes.filter((n) => n.type === "start");
    if (startNodes.length === 0) {
      setError("No Start node found. Add a Start node to your workflow before simulating.");
      return;
    }
    if (startNodes.length > 1) {
      setError(`Found ${startNodes.length} Start nodes. A workflow must have exactly one entry point.`);
      return;
    }
    if (nodes.length < 2) {
      setError("Workflow is too short. Connect at least two nodes before running a simulation.");
      return;
    }

    setLoading(true);
    setHasRun(true);

    const t0 = performance.now();

    const graphNodes = nodes.map((n) => ({
      id:   n.id,
      type: n.type ?? "unknown",
      data: { label: n.data.label },
    }));

    const graphEdges = edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));

    const result = await simulateWorkflow(graphNodes, graphEdges);

    setElapsed(Math.round(performance.now() - t0));
    setLogs(result.logs);
    setLoading(false);
  }, [nodes, edges]);

  const handleClear = useCallback(() => {
    setLogs([]);
    setError(null);
    setElapsed(null);
    setHasRun(false);
  }, []);

  return (
    <>
      {/* Backdrop — clicking outside closes the drawer */}
      <div
        className={`
          fixed inset-0 z-20 bg-black/10 backdrop-blur-[1px] transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 right-0 z-30 h-full w-96 bg-white border-l border-neutral-100
          shadow-2xl shadow-neutral-900/10 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div>
            <p className="text-sm font-semibold text-neutral-800">Simulation Sandbox</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {nodes.length} node{nodes.length !== 1 ? "s" : ""} · {edges.length} edge{edges.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Controls */}
        <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2 shrink-0">
          <button
            onClick={handleRun}
            disabled={loading}
            className="
              flex-1 flex items-center justify-center gap-2
              rounded-lg bg-neutral-900 text-white text-xs font-semibold
              px-3 py-2 hover:bg-neutral-800 active:bg-neutral-950
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {loading ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Running…
              </>
            ) : (
              <>
                <span className="text-[11px]">▷</span>
                Run Simulation
              </>
            )}
          </button>

          {hasRun && !loading && (
            <button
              onClick={handleClear}
              className="
                px-3 py-2 rounded-lg border border-neutral-200 text-xs text-neutral-500
                hover:bg-neutral-50 hover:text-neutral-700 transition-colors
              "
            >
              Clear
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Validation error */}
          {error && !loading && <ValidationError message={error} />}

          {/* Skeleton */}
          {loading && <TimelineSkeleton />}

          {/* Results */}
          {!loading && logs.length > 0 && (
            <>
              {elapsed !== null && (
                <ResultSummary logs={logs} elapsed={elapsed} />
              )}
              <div>
                {logs.map((log, i) => (
                  <TimelineEntry
                    key={`${log.nodeId}-${log.step}`}
                    log={log}
                    isLast={i === logs.length - 1}
                  />
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {!loading && !error && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 pb-12">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-lg">
                ▷
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-700 mb-1">
                  Ready to simulate
                </p>
                <p className="text-[11px] text-neutral-400 leading-relaxed max-w-[200px]">
                  Build your workflow on the canvas, then run a simulation to trace the execution path.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-neutral-100 shrink-0">
          <p className="text-[10px] text-neutral-400 leading-relaxed">
            Simulation traverses the graph via BFS from the Start node. Unreachable nodes are flagged.
          </p>
        </div>
      </aside>
    </>
  );
}