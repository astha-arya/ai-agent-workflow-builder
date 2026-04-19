import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { AutomatedNode as AutomatedNodeType } from "../../../types/workflow";

function AutomatedNode({ data, selected }: NodeProps<AutomatedNodeType>) {
  return (
    <div
      className={`
        min-w-[200px] rounded-xl border bg-white shadow-sm transition-shadow
        ${selected ? "border-violet-400 shadow-violet-100 shadow-md" : "border-neutral-200"}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !rounded-full !border-2 !border-violet-400 !bg-white"
      />

      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100">
        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-violet-50 text-violet-600 text-xs">
          ⚡
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
        <span className="ml-auto shrink-0 text-[10px] text-violet-600 font-medium bg-violet-50 px-2 py-0.5 rounded-full">
          Auto
        </span>
      </div>

      <div className="px-3 py-2">
        <code className="block text-[10px] font-mono text-violet-700 bg-violet-50 px-2 py-1 rounded-lg border border-violet-100 truncate">
          {data.actionId}
        </code>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !rounded-full !border-2 !border-violet-400 !bg-white"
      />
    </div>
  );
}

export default memo(AutomatedNode);