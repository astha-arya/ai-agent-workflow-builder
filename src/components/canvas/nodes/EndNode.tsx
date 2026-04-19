import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { EndNode as EndNodeType } from "../../../types/workflow";

// FIX: Added the missing '<' right after Record
const OUTCOME_STYLE: Record<
  EndNodeType["data"]["outcome"],
  { label: string; pill: string; dot: string }
> = {
  success:   { label: "Success",   pill: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-400" },
  failure:   { label: "Failure",   pill: "bg-rose-50    text-rose-600    border-rose-100",    dot: "bg-rose-400"    },
  cancelled: { label: "Cancelled", pill: "bg-neutral-100 text-neutral-500 border-neutral-200", dot: "bg-neutral-400" },
};

// FIX: Simplified NodeProps to avoid the strict generic clash
function EndNode({ data, selected }: NodeProps) {
  // We have to cast data to the specific type since we removed the generic above
  const nodeData = data as EndNodeType["data"];
  const style = OUTCOME_STYLE[nodeData.outcome];

  return (
    <div
      className={`
        min-w-[180px] rounded-xl border bg-white shadow-sm transition-shadow
        ${selected ? "border-rose-400 shadow-rose-100 shadow-md" : "border-neutral-200"}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !rounded-full !border-2 !border-rose-400 !bg-white"
      />

      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100">
        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-50 text-rose-600 text-xs">
          ■
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-neutral-700 leading-none truncate">
            {nodeData.label}
          </p>
          {nodeData.description && (
            <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
              {nodeData.description}
            </p>
          )}
        </div>
        <span className="ml-auto shrink-0 text-[10px] text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded-full">
          End
        </span>
      </div>

      <div className="px-3 py-2">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${style.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot} inline-block`} />
          {style.label}
        </span>
      </div>
    </div>
  );
}

export default memo(EndNode);