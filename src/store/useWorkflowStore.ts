import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { WorkflowNode, WorkflowEdge } from "../types/workflow";

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
}

interface WorkflowActions {
  // Handlers wired directly into <ReactFlow> props
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  

  addNode: (node: WorkflowNode) => void;
  setSelectedNodeId: (id: string | null) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNode["data"]>) => void;
}

export const useWorkflowStore = create<WorkflowState & WorkflowActions>(
  (set) => ({
    // ── Initial state ─────────────────────────────────────────────────────────
    nodes: [],
    edges: [],
    selectedNodeId: null,

    // ── ReactFlow change handlers ─────────────────────────────────────────────
    // applyNodeChanges handles moves, resizes, selections, and removals
    // without us needing to write that diffing logic manually.
    onNodesChange: (changes) =>
      set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

    onEdgesChange: (changes) =>
      set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

    // addEdge merges the new connection into the existing edge array,
    // deduplicating by source/target/handle automatically.
    onConnect: (connection) =>
      set((s) => ({ edges: addEdge(connection, s.edges) })),

    // ── Domain actions ────────────────────────────────────────────────────────
    addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),

    setSelectedNodeId: (id) => set({ selectedNodeId: id }),

    // Merges partial data into a single node; the canvas re-renders reactively.
    updateNodeData: (id, data) =>
      set((s) => ({
        nodes: s.nodes.map((n) =>
          n.id === id 
            ? ({ ...n, data: { ...n.data, ...data } } as WorkflowNode) 
            : n
        ),
      })),
  })
);