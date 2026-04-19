import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ApprovalNode as ApprovalNodeType } from "../../../types/workflow";

function ApprovalNode({ data, selected }: NodeProps<ApprovalNodeType>) {
  return (
    <div
      className={`
        min-w-[220px] rounded-xl border bg-white shadow-sm transition-shadow
        ${selected ? "border-amber-400 shadow-amber-100 shadow-md" : "border-neutral-200"}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !rounded-full !border-2 !border-amber-400 !bg-white"
      />

      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100">
        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-50 text-amber-600 text-xs">
          ◈
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
        <span className="ml-auto shrink-0 text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
          Approval
        </span>
      </div>

      <div className="px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {data.approvers.map((a) => (
            <span
              key={a}
              className="text-[10px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full"
            >
              {a}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-[10px] text-neutral-400">
            Mode:{" "}
            <span className="font-medium text-neutral-600">
              {data.requireAll ? "All must approve" : "Any approver"}
            </span>
          </span>
          {data.timeoutHours !== undefined && (
            <span className="text-[10px] text-neutral-400">
              · {data.timeoutHours}h timeout
            </span>
          )}
        </div>
      </div>

      {/* Approval nodes fan out: approved (right) and rejected (left) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="approved"
        style={{ left: "35%" }}
        className="!w-3 !h-3 !rounded-full !border-2 !border-emerald-400 !bg-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="rejected"
        style={{ left: "65%" }}
        className="!w-3 !h-3 !rounded-full !border-2 !border-rose-400 !bg-white"
      />
    </div>
  );
}

export default memo(ApprovalNode);