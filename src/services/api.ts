export interface AutomationOption {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationLog {
  step: number;
  nodeId: string;
  nodeLabel: string;
  message: string;
  status: "success" | "pending" | "error";
}

export interface SimulateResult {
  status: "success" | "error";
  logs: SimulationLog[];
}

// Minimal shape we need from the store — avoids importing full WorkflowNode here
interface GraphNode {
  id: string;
  type: string;
  data: { label: string };
}

interface GraphEdge {
  source: string;
  target: string;
}

const AUTOMATIONS: AutomationOption[] = [
  { id: "send_email",    label: "Send Email",        params: ["to", "subject"]         },
  { id: "generate_doc",  label: "Generate Document", params: ["template", "recipient"] },
  { id: "call_webhook",  label: "Call Webhook",       params: ["url", "method"]         },
  { id: "create_ticket", label: "Create Ticket",      params: ["project", "priority"]   },
];

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function fetchAutomations(): Promise<AutomationOption[]> {
  await delay(300);
  return AUTOMATIONS;
}

// Walks the graph via BFS from the Start node, following edges in order.
// Returns logs in traversal order — one entry per reachable node.
export async function simulateWorkflow(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Promise<SimulateResult> {
  await delay(800);

  const startNode = nodes.find((n) => n.type === "start");
  if (!startNode) {
    return {
      status: "error",
      logs: [{
        step: 0,
        nodeId: "",
        nodeLabel: "Validation",
        message: "No Start node found in the graph.",
        status: "error",
      }],
    };
  }

  // Build an adjacency list keyed by source node id
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const targets = adjacency.get(edge.source) ?? [];
    targets.push(edge.target);
    adjacency.set(edge.source, targets);
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // BFS traversal — visited set prevents infinite loops on cyclic graphs
  const visited = new Set<string>();
  const queue: string[] = [startNode.id];
  const logs: SimulationLog[] = [];
  let step = 1;

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const current = nodeMap.get(currentId);
    if (!current) continue;

    logs.push({
      step,
      nodeId: current.id,
      nodeLabel: current.data.label,
      message: buildLogMessage(current.type, current.data.label),
      status: current.type === "end" ? "success" : "success",
    });

    step++;
    const nextIds = adjacency.get(currentId) ?? [];
    queue.push(...nextIds);
  }

  // Nodes that were never reached get flagged
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      logs.push({
        step,
        nodeId: node.id,
        nodeLabel: node.data.label,
        message: `Node unreachable — no incoming edge from traversal path.`,
        status: "error",
      });
      step++;
    }
  }

  return { status: "success", logs };
}

function buildLogMessage(type: string, label: string): string {
  switch (type) {
    case "start":     return `Workflow triggered — entry point "${label}" initialised.`;
    case "task":      return `Task "${label}" dispatched to assignee queue.`;
    case "approval":  return `Approval gate "${label}" opened — awaiting sign-off.`;
    case "automated": return `Automation "${label}" executed successfully.`;
    case "end":       return `Workflow reached terminal node "${label}". Run complete.`;
    default:          return `Node "${label}" processed.`;
  }
}