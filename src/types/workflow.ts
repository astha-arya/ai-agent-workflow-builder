import type { Node, Edge } from "@xyflow/react";

// ─── Node-type discriminator ──────────────────────────────────────────────────

export type WorkflowNodeType =
  | "start"
  | "task"
  | "approval"
  | "automated"
  | "end";

// ─── Per-node data payloads ───────────────────────────────────────────────────

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
}

export interface StartNodeData extends BaseNodeData {
  triggerType: "manual" | "scheduled" | "webhook";
}

export interface TaskNodeData extends BaseNodeData {
  assignee?: string;
  dueOffsetDays?: number;
  /** Metrics shown in the card (mirrors the stat pills in the reference UI) */
  stats?: {
    members: number;
    tasks: number;
    active: number;
    done: number;
  };
}

export interface ApprovalNodeData extends BaseNodeData {
  approvers: string[];
  /** If true, ANY approver can advance; otherwise ALL must approve */
  requireAll: boolean;
  timeoutHours?: number;
}

export interface AutomatedNodeData extends BaseNodeData {
  /** ID of the integration/action to execute (e.g. "send-email", "call-webhook") */
  actionId: string;
  configJson?: string; // serialised config blob
}

export interface EndNodeData extends BaseNodeData {
  outcome: "success" | "failure" | "cancelled";
}

// ─── Typed ReactFlow node wrappers ────────────────────────────────────────────

export type StartNode     = Node<StartNodeData,     "start">;
export type TaskNode      = Node<TaskNodeData,      "task">;
export type ApprovalNode  = Node<ApprovalNodeData,  "approval">;
export type AutomatedNode = Node<AutomatedNodeData, "automated">;
export type EndNode       = Node<EndNodeData,       "end">;

/** Union that covers every node variant in the canvas */
export type WorkflowNode =
  | StartNode
  | TaskNode
  | ApprovalNode
  | AutomatedNode
  | EndNode;

export type WorkflowEdge = Edge;