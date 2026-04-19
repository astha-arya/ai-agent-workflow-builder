import { useEffect, useState, useCallback } from "react";
import { useWorkflowStore } from "../../store/useWorkflowStore";
import { fetchAutomations, type AutomationOption } from "../../services/api";
import type {
  WorkflowNode,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from "../../types/workflow";

// ─── Shared form primitives ───────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        w-full rounded-md border border-neutral-200 bg-neutral-50
        px-2.5 py-1.5 text-xs text-neutral-800 placeholder-neutral-300
        focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
        transition-colors
      "
    />
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={placeholder}
      className="
        w-full rounded-md border border-neutral-200 bg-neutral-50
        px-2.5 py-1.5 text-xs text-neutral-800 placeholder-neutral-300
        focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
        transition-colors
      "
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 group"
    >
      <span
        className={`
          relative inline-flex w-8 h-4 rounded-full transition-colors duration-200 shrink-0
          ${checked ? "bg-blue-500" : "bg-neutral-300"}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${checked ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </span>
      <span className="text-xs text-neutral-600 group-hover:text-neutral-800 transition-colors">
        {label}
      </span>
    </button>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  options: AutomationOption[];
  loading: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className="
        w-full rounded-md border border-neutral-200 bg-neutral-50
        px-2.5 py-1.5 text-xs text-neutral-800
        focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300
        transition-colors disabled:opacity-50
      "
    >
      {loading ? (
        <option>Loading…</option>
      ) : (
        options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))
      )}
    </select>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// ─── Per-type forms ───────────────────────────────────────────────────────────

function StartForm({
  data,
  update,
}: {
  data: StartNodeData;
  update: (d: Partial<StartNodeData>) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Label">
        <TextInput
          value={data.label}
          onChange={(v) => update({ label: v })}
          placeholder="Start"
        />
      </Field>
      <Field label="Description">
        <TextInput
          value={data.description ?? ""}
          onChange={(v) => update({ description: v })}
          placeholder="Optional"
        />
      </Field>
      <Field label="Trigger Type">
        <select
          value={data.triggerType}
          onChange={(e) =>
            update({ triggerType: e.target.value as StartNodeData["triggerType"] })
          }
          className="
            w-full rounded-md border border-neutral-200 bg-neutral-50
            px-2.5 py-1.5 text-xs text-neutral-800
            focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300
            transition-colors
          "
        >
          <option value="manual">Manual</option>
          <option value="scheduled">Scheduled</option>
          <option value="webhook">Webhook</option>
        </select>
      </Field>
    </div>
  );
}

function TaskForm({
  data,
  update,
}: {
  data: TaskNodeData;
  update: (d: Partial<TaskNodeData>) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Label">
        <TextInput
          value={data.label}
          onChange={(v) => update({ label: v })}
          placeholder="Task name"
        />
      </Field>
      <Field label="Description">
        <TextInput
          value={data.description ?? ""}
          onChange={(v) => update({ description: v })}
          placeholder="What needs to be done"
        />
      </Field>
      <Field label="Assignee">
        <TextInput
          value={data.assignee ?? ""}
          onChange={(v) => update({ assignee: v })}
          placeholder="e.g. alice@co.com"
        />
      </Field>
      <Field label="Due Offset (days)">
        <NumberInput
          value={data.dueOffsetDays}
          onChange={(v) => update({ dueOffsetDays: v })}
          placeholder="0"
        />
      </Field>
    </div>
  );
}

function ApprovalForm({
  data,
  update,
}: {
  data: ApprovalNodeData;
  update: (d: Partial<ApprovalNodeData>) => void;
}) {
  // Store the raw comma-string locally so typing "alice, " doesn't immediately
  // strip the trailing comma before the user finishes the next name.
  const [approversRaw, setApproversRaw] = useState(data.approvers.join(", "));

  const handleApproversBlur = useCallback(() => {
    const parsed = approversRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    update({ approvers: parsed });
  }, [approversRaw, update]);

  return (
    <div className="space-y-3">
      <Field label="Label">
        <TextInput
          value={data.label}
          onChange={(v) => update({ label: v })}
          placeholder="Approval step"
        />
      </Field>
      <Field label="Approvers (comma-separated)">
        <input
          type="text"
          value={approversRaw}
          onChange={(e) => setApproversRaw(e.target.value)}
          onBlur={handleApproversBlur}
          placeholder="alice, bob, carol"
          className="
            w-full rounded-md border border-neutral-200 bg-neutral-50
            px-2.5 py-1.5 text-xs text-neutral-800 placeholder-neutral-300
            focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300
            transition-colors
          "
        />
        <p className="mt-1 text-[10px] text-neutral-400">
          {data.approvers.length} approver{data.approvers.length !== 1 ? "s" : ""} saved
        </p>
      </Field>
      <Field label="Approval Mode">
        <Toggle
          checked={data.requireAll}
          onChange={(v) => update({ requireAll: v })}
          label={data.requireAll ? "All must approve" : "Any approver"}
        />
      </Field>
      <Field label="Timeout (hours)">
        <NumberInput
          value={data.timeoutHours}
          onChange={(v) => update({ timeoutHours: v })}
          placeholder="e.g. 48"
        />
      </Field>
    </div>
  );
}

function AutomatedForm({
  data,
  update,
}: {
  data: AutomatedNodeData;
  update: (d: Partial<AutomatedNodeData>) => void;
}) {
  const [automations, setAutomations] = useState<AutomationOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the automations list once on mount; keep it local to this form
  // because it's UI-only data, not workflow graph state.
  useEffect(() => {
    fetchAutomations().then((opts) => {
      setAutomations(opts);
      setLoading(false);
      // Seed actionId if it's still the placeholder default
      if (data.actionId === "action/new" && opts[0]) {
        update({ actionId: opts[0].id });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once per mount

  const selected = automations.find((a) => a.id === data.actionId);

  return (
    <div className="space-y-3">
      <Field label="Label">
        <TextInput
          value={data.label}
          onChange={(v) => update({ label: v })}
          placeholder="Automation step"
        />
      </Field>
      <Field label="Action">
        <SelectInput
          value={data.actionId}
          onChange={(v) => update({ actionId: v })}
          options={automations}
          loading={loading}
        />
      </Field>
      {selected && (
        <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 space-y-1">
          <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-widest">
            Required params
          </p>
          <div className="flex flex-wrap gap-1">
            {selected.params.map((p) => (
              <code
                key={p}
                className="text-[10px] bg-white text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded"
              >
                {p}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EndForm({
  data,
  update,
}: {
  data: EndNodeData;
  update: (d: Partial<EndNodeData>) => void;
}) {
  return (
    <div className="space-y-3">
      <Field label="Label">
        <TextInput
          value={data.label}
          onChange={(v) => update({ label: v })}
          placeholder="End"
        />
      </Field>
      <Field label="Description">
        <TextInput
          value={data.description ?? ""}
          onChange={(v) => update({ description: v })}
          placeholder="Optional"
        />
      </Field>
      <Field label="Outcome">
        <select
          value={data.outcome}
          onChange={(e) =>
            update({ outcome: e.target.value as EndNodeData["outcome"] })
          }
          className="
            w-full rounded-md border border-neutral-200 bg-neutral-50
            px-2.5 py-1.5 text-xs text-neutral-800
            focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300
            transition-colors
          "
        >
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Field>
    </div>
  );
}

// ─── Unified node form dispatcher ─────────────────────────────────────────────

function NodeForm({ node }: { node: WorkflowNode }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  // Narrow the update call through the discriminated union so each sub-form
  // receives and emits only its own data shape — no casting needed downstream.
  switch (node.type) {
    case "start":
      return (
        <StartForm
          data={node.data}
          update={(d) => updateNodeData(node.id, d)}
        />
      );
    case "task":
      return (
        <TaskForm
          data={node.data}
          update={(d) => updateNodeData(node.id, d)}
        />
      );
    case "approval":
      return (
        <ApprovalForm
          data={node.data}
          update={(d) => updateNodeData(node.id, d)}
        />
      );
    case "automated":
      return (
        <AutomatedForm
          data={node.data}
          update={(d) => updateNodeData(node.id, d)}
        />
      );
    case "end":
      return (
        <EndForm
          data={node.data}
          update={(d) => updateNodeData(node.id, d)}
        />
      );
  }
}

// ─── Accent colors per node type ──────────────────────────────────────────────

const TYPE_META: Record<
  WorkflowNode["type"],
  { label: string; pill: string; dot: string }
> = {
  start:     { label: "Start Node",     pill: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-400" },
  task:      { label: "Task Node",      pill: "bg-blue-50    text-blue-600",    dot: "bg-blue-400"    },
  approval:  { label: "Approval Node",  pill: "bg-amber-50   text-amber-600",   dot: "bg-amber-400"   },
  automated: { label: "Automated Node", pill: "bg-violet-50  text-violet-600",  dot: "bg-violet-400"  },
  end:       { label: "End Node",       pill: "bg-rose-50    text-rose-600",    dot: "bg-rose-400"    },
};

// ─── Root sidebar ─────────────────────────────────────────────────────────────

export default function RightSidebar() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const selectedNode   = useWorkflowStore((s) =>
    s.nodes.find((n) => n.id === selectedNodeId)
  );

  return (
    <aside className="flex flex-col w-72 shrink-0 border-l border-neutral-100 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-[14px] border-b border-neutral-100">
        <span className="text-sm font-semibold text-neutral-800">
          {selectedNode ? "Node Config" : "Performance Overview"}
        </span>
        {selectedNode && (
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5 ${TYPE_META[selectedNode.type].pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${TYPE_META[selectedNode.type].dot}`} />
            {TYPE_META[selectedNode.type].label}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {selectedNode ? (
          <>
            {/* Node identity — read-only */}
            <div className="mb-4 p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
              <p className="text-[10px] text-neutral-400 font-mono truncate">
                id: {selectedNode.id}
              </p>
            </div>

            {/* Dynamic form for this node type */}
            <NodeForm key={selectedNode.id} node={selectedNode} />
          </>
        ) : (
          // Empty-state placeholder panel
          <div className="space-y-3">
            <p className="text-[10px] text-neutral-400 leading-relaxed">
              Click any node on the canvas to edit its properties here.
            </p>
            {["Workflow A", "Workflow B", "Flow Objectives"].map((title) => (
              <div
                key={title}
                className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 space-y-2"
              >
                <p className="text-xs font-semibold text-neutral-700">{title}</p>
                <div className="h-1.5 w-full rounded-full bg-neutral-200" />
                <div className="flex gap-1.5">
                  {(["bg-red-300", "bg-blue-300", "bg-green-300"] as const).map((c) => (
                    <span
                      key={c}
                      className={`${c} text-[10px] text-white font-medium px-2 py-0.5 rounded-full`}
                    >
                      •• 12
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}