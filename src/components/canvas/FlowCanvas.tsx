import { useCallback, useRef, type DragEvent } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type NodeMouseHandler,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkflowStore } from "../../store/useWorkflowStore";
import type {
  WorkflowNode,
  WorkflowNodeType,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from "../../types/workflow";

import StartNode    from "./nodes/StartNode";
import TaskNode     from "./nodes/TaskNode";
import ApprovalNode from "./nodes/ApprovalNode";
import AutomatedNode from "./nodes/AutomatedNode";
import EndNode      from "./nodes/EndNode";

// Registered once outside the component so the object reference is stable
// across renders — prevents React Flow from remounting nodes unnecessarily.
const NODE_TYPES = {
  start:     StartNode,
  task:      TaskNode,
  approval:  ApprovalNode,
  automated: AutomatedNode,
  end:       EndNode,
} as const;

/** Build a sensible default data payload for each node type on drop */
function buildDefaultData(type: WorkflowNodeType): WorkflowNode["data"] {
  switch (type) {
    case "start":
      return { label: "Start", triggerType: "manual" } satisfies StartNodeData;
    case "task":
      return { label: "Task", description: "Performing task" } satisfies TaskNodeData;
    case "approval":
      return {
        label: "Approval",
        approvers: ["Owner"],
        requireAll: false,
      } satisfies ApprovalNodeData;
    case "automated":
      return {
        label: "Automated",
        actionId: "action/new",
      } satisfies AutomatedNodeData;
    case "end":
      return { label: "End", outcome: "success" } satisfies EndNodeData;
  }
}

let nodeCounter = 1;
function generateId(type: WorkflowNodeType): string {
  return `${type}-${nodeCounter++}`;
}

export default function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNodeId } =
    useWorkflowStore();

  // We need the ReactFlow instance to call screenToFlowPosition on drop.
  const rfInstanceRef = useRef<ReactFlowInstance<WorkflowNode> | null>(null);

  const handleNodeClick = useCallback<NodeMouseHandler<WorkflowNode>>(
    (_, node) => setSelectedNodeId(node.id),
    [setSelectedNodeId]
  );

  const handlePaneClick = useCallback(
    () => setSelectedNodeId(null),
    [setSelectedNodeId]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const type = e.dataTransfer.getData(
        "application/agentflow-node-type"
      ) as WorkflowNodeType;

      if (!type || !rfInstanceRef.current) return;

      // screenToFlowPosition converts the raw viewport pixel coordinates
      // from the drop event into React Flow's internal graph coordinate space,
      // accounting for pan offset and zoom level.
      const position = rfInstanceRef.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      const id = generateId(type);

      // WorkflowNode is a discriminated union — we cast through `unknown`
      // because TypeScript cannot narrow the union on a runtime string.
      const newNode = {
        id,
        type,
        position,
        data: buildDefaultData(type),
      } as unknown as WorkflowNode;

      addNode(newNode);
      setSelectedNodeId(id);
    },
    [addNode, setSelectedNodeId]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={handleNodeClick}
      onPaneClick={handlePaneClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onInit={(instance) => { rfInstanceRef.current = instance; }}
      fitView
      className="bg-neutral-50"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1.2}
        color="#d1d5db"
      />
      <Controls
        className="!shadow-sm !border !border-neutral-100 !rounded-xl !bg-white"
        showInteractive={false}
        style={{ marginBottom: '40px' }}
      />
      <MiniMap
        className="!shadow-sm !border !border-neutral-100 !rounded-xl !bg-white"
        maskColor="rgba(0,0,0,0.04)"
        nodeStrokeWidth={2}
      />
    </ReactFlow>
  );
}