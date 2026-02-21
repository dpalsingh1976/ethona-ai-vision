import { X, GitBranch, MessageSquare, Brain, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Agent } from "@/hooks/useAgents";

interface AgentTestPanelProps {
  agent: Agent;
  onClose: () => void;
}

interface FlowNode {
  id: string;
  type: string;
  instruction?: { text?: string };
  extract_dynamic_variable?: Array<{ name: string; description: string }>;
  conditions?: Array<{ id: string; destination_node_id: string }>;
  edges?: Array<{ id: string; destination_node_id: string }>;
}

const NODE_ICONS: Record<string, typeof MessageSquare> = {
  conversation: MessageSquare,
  logic_split: Brain,
};

export function AgentTestPanel({ agent, onClose }: AgentTestPanelProps) {
  const workflow = agent.published_workflow as { nodes?: FlowNode[] } | null;
  const nodes: FlowNode[] = workflow?.nodes || [];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-background shadow-xl animate-in slide-in-from-right">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="font-display font-semibold">{agent.name}</h2>
          <p className="text-sm text-muted-foreground">Conversation Flow Preview</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-65px)]">
        <div className="p-4 space-y-3">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <h3 className="font-display text-sm font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Lead Classification Logic
            </h3>
            <div className="grid gap-1.5 text-xs">
              <div className="flex items-center gap-2">
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">HOT</Badge>
                <span>Timeline ≤ 3mo + Pre-approved + Budget + No agent</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">WARM</Badge>
                <span>Timeline 3–6mo or missing one criteria</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">COLD</Badge>
                <span>Timeline &gt; 6mo or early stage</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="opacity-70">DISQUALIFIED</Badge>
                <span>Has another agent</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <h3 className="font-display text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-accent" />
              Data Extraction Fields
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {["caller_name", "phone", "email", "timeline", "budget", "financing_status", "preferred_locations", "bedrooms", "bathrooms", "has_agent", "lead_status", "appointment_requested"].map((field) => (
                <Badge key={field} variant="outline" className="text-xs font-mono">{field}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-sm font-semibold flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              Node Map ({nodes.length} nodes)
            </h3>

            {nodes.map((node) => {
              const Icon = NODE_ICONS[node.type] || MessageSquare;
              const prompt = node.instruction?.text || "";
              const destinations = node.edges?.map((e) => e.destination_node_id) || node.conditions?.map((c) => c.destination_node_id) || [];

              return (
                <div key={node.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-mono text-sm font-medium">{node.id}</span>
                    <Badge variant="outline" className="text-xs ml-auto">{node.type}</Badge>
                  </div>
                  {prompt && <p className="text-xs text-muted-foreground line-clamp-2">{prompt}</p>}
                  {node.extract_dynamic_variable && node.extract_dynamic_variable.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {node.extract_dynamic_variable.map((v) => (
                        <Badge key={v.name} variant="secondary" className="text-xs font-mono">📥 {v.name}</Badge>
                      ))}
                    </div>
                  )}
                  {destinations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {destinations.map((d) => (
                        <Badge key={d} variant="outline" className="text-xs font-mono">→ {d}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
