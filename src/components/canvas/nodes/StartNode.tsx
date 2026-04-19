import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { StartNode as StartNodeType } from "../../../types/workflow";

const TRIGGER_LABEL: Record<StartNodeType["data"]["triggerType"], string> = {
  manual: "Manual trigger",
  scheduled: "Scheduled",
  webhook: "Webhook",
};

function StartNode({ data, selected }: NodeProps<StartNodeType>) {
  return (
    <div
      className={`
        min-w-[200px] rounded-xl border bg-white shadow-sm transition-shadow
        ${selected ? "border-emerald-400 shadow-emerald-100 shadow-md" : "border-neutral-200"}
      `}
    >
      {/* Header strip */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100">
        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 text-xs">
          ▷
        </span>
        <span className="text-xs font-semibold text-neutral-700 leading-none">
          {data.label}
        </span>
        <span className="ml-auto text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
          Start
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        {data.description && (
          <p className="text-[10px] text-neutral-400 mb-1.5">{data.description}</p>
        )}
        <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded-full border border-neutral-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          {TRIGGER_LABEL[data.triggerType]}
        </span>
      </div>

      {/* Only a source — nothing flows into a Start node */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !rounded-full !border-2 !border-emerald-400 !bg-white"
      />
    </div>
  );
}

export default memo(StartNode);