import { useCallback, useMemo } from "react";
import { X, Brain, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import type { Agent } from "@/hooks/useAgents";

interface AgentTestPanelProps {
  agent: Agent;
  onClose: () => void;
}

// ── Friendly label map ──────────────────────────────────────────────────────
const LABEL_MAP: Record<string, string> = {
  greeting: "Greeting",
  permission_bridge: "Permission Check",
  discovery: "Discovery",
  soft_objection_greeting: "Soft Objection",
  value_bridge: "Value Mirror",
  objection_handler: "Objection Handler",
  live_transfer: "Live Transfer",
  schedule_appointment: "Schedule Appointment",
  callback: "Schedule Callback",
  voicemail: "Voicemail",
  wrong_number: "Wrong Number",
  gatekeeper: "Gatekeeper",
  wrap_up: "Wrap Up",
  not_interested: "Not Interested / DNC",
  end_call: "End Call",
};

const TERMINAL_NODES = new Set(["end_call", "wrap_up", "not_interested", "wrong_number"]);
const ACTION_NODES = new Set(["live_transfer", "schedule_appointment", "callback", "voicemail"]);

function getNodeColor(id: string, type: string) {
  if (TERMINAL_NODES.has(id)) return { bg: "hsl(var(--muted))", border: "hsl(var(--border))", text: "hsl(var(--muted-foreground))" };
  if (ACTION_NODES.has(id)) return { bg: "hsl(142 76% 10%)", border: "hsl(142 76% 36%)", text: "hsl(142 76% 60%)" };
  if (type === "logic_split") return { bg: "hsl(25 95% 10%)", border: "hsl(25 95% 50%)", text: "hsl(25 95% 65%)" };
  return { bg: "hsl(var(--primary) / 0.08)", border: "hsl(var(--primary) / 0.5)", text: "hsl(var(--primary))" };
}

// ── Custom Node ─────────────────────────────────────────────────────────────
function FlowNode({ data }: NodeProps) {
  const d = data as {
    label: string;
    nodeType: string;
    prompt: string;
    variables: string[];
    colors: { bg: string; border: string; text: string };
  };

  return (
    <div
      className="rounded-xl px-3 py-2.5 shadow-md min-w-[160px] max-w-[220px] text-xs"
      style={{
        background: d.colors.bg,
        border: `1.5px solid ${d.colors.border}`,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: d.colors.border }} />
      <div className="flex items-center gap-1.5 mb-1">
        <span className="font-semibold text-[11px]" style={{ color: d.colors.text }}>
          {d.label}
        </span>
        <span
          className="ml-auto rounded px-1 py-0.5 text-[9px] font-mono opacity-70"
          style={{ background: d.colors.border, color: "hsl(var(--background))" }}
        >
          {d.nodeType}
        </span>
      </div>
      {d.prompt && (
        <p className="text-muted-foreground leading-tight line-clamp-2 text-[10px]">{d.prompt}</p>
      )}
      {d.variables.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1.5">
          {d.variables.slice(0, 3).map((v: string) => (
            <span key={v} className="rounded bg-secondary/50 px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
              📥 {v}
            </span>
          ))}
          {d.variables.length > 3 && (
            <span className="text-[9px] text-muted-foreground">+{d.variables.length - 3}</span>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Right} style={{ background: d.colors.border }} />
    </div>
  );
}

const NODE_TYPES = { flowNode: FlowNode };

// ── Raw flow node shape from Retell ─────────────────────────────────────────
interface RetellNode {
  id: string;
  type: string;
  instruction?: { text?: string };
  extract_dynamic_variable?: Array<{ name: string }>;
  edges?: Array<{ destination_node_id: string; description?: string }>;
  conditions?: Array<{ destination_node_id: string; description?: string }>;
  display_position?: { x: number; y: number };
}

// ── Build React Flow nodes/edges from raw Retell data ───────────────────────
function buildGraph(rawNodes: RetellNode[]) {
  const COLS = 4;
  const X_GAP = 270;
  const Y_GAP = 160;

  const rfNodes: Node[] = rawNodes.map((n, i) => {
    const label = LABEL_MAP[n.id] || n.id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const colors = getNodeColor(n.id, n.type);
    const hasPosition = n.display_position && (n.display_position.x !== 0 || n.display_position.y !== 0);
    const x = hasPosition ? n.display_position!.x : (i % COLS) * X_GAP;
    const y = hasPosition ? n.display_position!.y : Math.floor(i / COLS) * Y_GAP;

    return {
      id: n.id,
      type: "flowNode",
      position: { x, y },
      data: {
        label,
        nodeType: n.type,
        prompt: n.instruction?.text?.slice(0, 100) || "",
        variables: n.extract_dynamic_variable?.map((v) => v.name) || [],
        colors,
      },
    };
  });

  const rfEdges: Edge[] = [];
  rawNodes.forEach((n) => {
    const connections = n.edges || n.conditions || [];
    connections.forEach((e, idx) => {
      rfEdges.push({
        id: `${n.id}->${e.destination_node_id}-${idx}`,
        source: n.id,
        target: e.destination_node_id,
        label: e.description ? e.description.split(" ").slice(0, 5).join(" ") + "…" : undefined,
        animated: true,
        style: { stroke: "hsl(var(--primary) / 0.4)" },
        labelStyle: { fontSize: 9, fill: "hsl(var(--muted-foreground))" },
        labelBgStyle: { fill: "hsl(var(--background))", fillOpacity: 0.8 },
      });
    });
  });

  return { rfNodes, rfEdges };
}

// ── Main Component ───────────────────────────────────────────────────────────
export function AgentTestPanel({ agent, onClose }: AgentTestPanelProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  // Support both legacy {nodes:[]} shape and new {flow:{nodes:[]}, agent:{}} shape
  const workflow = agent.published_workflow as {
    nodes?: RetellNode[];
    flow?: { nodes?: RetellNode[] };
  } | null;

  const rawNodes: RetellNode[] =
    workflow?.flow?.nodes || workflow?.nodes || [];

  const { rfNodes, rfEdges } = useMemo(() => buildGraph(rawNodes), [rawNodes]);

  const onNodesChange = useCallback(() => {}, []);
  const onEdgesChange = useCallback(() => {}, []);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden"
        style={{ maxWidth: "92vw", width: "92vw", height: "90vh", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3 shrink-0">
          <div>
            <h2 className="font-display font-semibold">{agent.name}</h2>
            <p className="text-xs text-muted-foreground">
              {rawNodes.length} nodes · Conversation Flow
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Collapsible info toggle */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setInfoOpen((v) => !v)}
            >
              <Brain className="h-3.5 w-3.5" />
              {infoOpen ? "Hide Info" : "Show Info"}
              {infoOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden" style={{ height: "calc(90vh - 57px)" }}>
          {/* Flow canvas */}
          <div className="flex-1 relative">
            {rawNodes.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <Brain className="h-10 w-10 opacity-30" />
                <p className="text-sm">No flow data yet.</p>
                <p className="text-xs opacity-60">Use "Sync from Retell" to pull the latest workflow.</p>
              </div>
            ) : (
              <ReactFlow
                nodes={rfNodes}
                edges={rfEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={NODE_TYPES}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                minZoom={0.3}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
              >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--border))" />
                <Controls className="[&>button]:bg-background [&>button]:border-border [&>button]:text-foreground" />
                <MiniMap
                  className="!bg-background !border !border-border rounded-lg"
                  nodeColor={(n) => {
                    const colors = (n.data as { colors?: { border: string } })?.colors;
                    return colors?.border || "hsl(var(--primary))";
                  }}
                />
              </ReactFlow>
            )}
          </div>

          {/* Collapsible info sidebar */}
          {infoOpen && (
            <div className="w-64 border-l bg-muted/20 overflow-y-auto shrink-0 p-4 space-y-4">
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-semibold">
                  <Brain className="h-4 w-4 text-primary" />
                  Lead Classification
                  <ChevronDown className="h-3 w-3 ml-auto" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 grid gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">HOT</Badge>
                    <span className="text-muted-foreground">≤3mo + pre-approved + budget</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">WARM</Badge>
                    <span className="text-muted-foreground">3–6mo or missing criteria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20">COLD</Badge>
                    <span className="text-muted-foreground">&gt;6mo or early stage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="opacity-70">DQ</Badge>
                    <span className="text-muted-foreground">Has another agent</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-semibold">
                  <CheckCircle className="h-4 w-4 text-accent" />
                  Extracted Fields
                  <ChevronDown className="h-3 w-3 ml-auto" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 flex flex-wrap gap-1.5">
                  {["caller_name", "phone", "email", "timeline", "budget", "financing_status", "preferred_locations", "bedrooms", "bathrooms", "has_agent", "lead_status", "appointment_requested"].map((field) => (
                    <Badge key={field} variant="outline" className="text-[10px] font-mono">{field}</Badge>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Node legend */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Legend</p>
                {[
                  { color: "hsl(var(--primary))", label: "Conversation" },
                  { color: "hsl(25 95% 50%)", label: "Logic / Split" },
                  { color: "hsl(142 76% 36%)", label: "Action Node" },
                  { color: "hsl(var(--border))", label: "Terminal" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-3 rounded-full border-2" style={{ borderColor: color, background: color + "22" }} />
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
