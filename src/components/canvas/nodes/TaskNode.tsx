import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { TaskNode as TaskNodeType } from "../../../types/workflow";

function StatPill({ value, color }: { value: number; color: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${color}`}
    >
      {value}
    </span>
  );
}

function TaskNode({ data, selected }: NodeProps<TaskNodeType>) {
  return (
    <div
      className={`
        min-w-[220px] rounded-xl border bg-white shadow-sm transition-shadow
        ${selected ? "border-blue-400 shadow-blue-100 shadow-md" : "border-neutral-200"}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !rounded-full !border-2 !border-blue-400 !bg-white"
      />

      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100">
        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 text-blue-600 text-xs">
          ☑
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-neutral-700 leading-none truncate">
            {data.label}
          </p>
          {data.description && (
            <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
              {data.description}
            </p>
          )}
        </div>
        <span className="ml-auto shrink-0 text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
          Task
        </span>
      </div>

      <div className="px-3 py-2">
        {data.assignee && (
          <p className="text-[10px] text-neutral-400 mb-1.5">
            Assignee: <span className="font-medium text-neutral-600">{data.assignee}</span>
          </p>
        )}

        {/* Stat pills — mirrors the icon + number badges in the CodeAuto reference */}
        {data.stats && (
          <div className="flex flex-wrap gap-1">
            <StatPill value={data.stats.members}  color="text-neutral-500 border-neutral-200 bg-neutral-50" />
            <StatPill value={data.stats.tasks}    color="text-neutral-500 border-neutral-200 bg-neutral-50" />
            <StatPill value={data.stats.active}   color="text-blue-600   border-blue-100   bg-blue-50"     />
            <StatPill value={data.stats.done}     color="text-emerald-600 border-emerald-100 bg-emerald-50" />
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !rounded-full !border-2 !border-blue-400 !bg-white"
      />
    </div>
  );
}

export default memo(TaskNode);