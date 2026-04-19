import type { DragEvent } from "react";
import type { WorkflowNodeType } from "../../types/workflow";

interface PaletteItem {
  type: WorkflowNodeType;
  label: string;
  description: string;
  accent: string;       // border-left color strip
  iconBg: string;       // icon pill background
  icon: string;         // emoji/unicode glyph (avoids lucide dependency at this layer)
}

const PALETTE: PaletteItem[] = [
  {
    type: "start",
    label: "Start",
    description: "Entry trigger",
    accent: "border-l-emerald-400",
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: "▷",
  },
  {
    type: "task",
    label: "Task",
    description: "Human task step",
    accent: "border-l-blue-400",
    iconBg: "bg-blue-50 text-blue-600",
    icon: "☑",
  },
  {
    type: "approval",
    label: "Approval",
    description: "Requires sign-off",
    accent: "border-l-amber-400",
    iconBg: "bg-amber-50 text-amber-600",
    icon: "◈",
  },
  {
    type: "automated",
    label: "Automated",
    description: "Action / integration",
    accent: "border-l-violet-400",
    iconBg: "bg-violet-50 text-violet-600",
    icon: "⚡",
  },
  {
    type: "end",
    label: "End",
    description: "Terminal state",
    accent: "border-l-rose-400",
    iconBg: "bg-rose-50 text-rose-600",
    icon: "■",
  },
];

function handleDragStart(e: DragEvent<HTMLDivElement>, type: WorkflowNodeType) {
  e.dataTransfer.setData("application/agentflow-node-type", type);
  e.dataTransfer.effectAllowed = "move";
}

export default function LeftSidebar() {
  return (
    <aside className="flex flex-col w-56 shrink-0 border-r border-neutral-100 bg-white select-none">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-[14px] border-b border-neutral-100">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500 text-white text-xs font-bold shadow-sm">
          A
        </span>
        <span className="text-sm font-semibold text-neutral-800 tracking-tight">
          AgentFlow
        </span>
      </div>

      {/* Navigation skeleton — General section */}
      <nav className="px-3 pt-4 pb-2">
        <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
          General
        </p>
        {["Dashboard", "Compliance", "Scheduler", "Analytics"].map((item) => (
          <div
            key={item}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
              item === "Dashboard"
                ? "bg-red-50 text-red-600 font-semibold"
                : "text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-sm bg-current opacity-40" />
            {item}
          </div>
        ))}
      </nav>

      {/* Node palette — the draggable section */}
      <div className="px-3 pt-3 pb-2">
        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
          Node Types
        </p>
        <p className="px-2 mb-3 text-[10px] text-neutral-400 leading-relaxed">
          Drag nodes onto the canvas to build your workflow.
        </p>

        <div className="space-y-1.5">
          {PALETTE.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl border border-neutral-100
                border-l-2 ${item.accent} bg-white cursor-grab active:cursor-grabbing
                hover:shadow-sm hover:border-neutral-200 transition-all duration-150
                group
              `}
            >
              <span
                className={`${item.iconBg} w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0`}
              >
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-700 leading-none mb-0.5">
                  {item.label}
                </p>
                <p className="text-[10px] text-neutral-400 truncate">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {/* Footer links */}
      <div className="px-3 py-3 border-t border-neutral-100 space-y-0.5">
        {["Settings", "Help & Support"].map((label) => (
          <div
            key={label}
            className="h-8 flex items-center px-2 rounded-md text-xs text-neutral-400 cursor-pointer hover:bg-neutral-50 transition-colors"
          >
            {label}
          </div>
        ))}
      </div>
    </aside>
  );
}