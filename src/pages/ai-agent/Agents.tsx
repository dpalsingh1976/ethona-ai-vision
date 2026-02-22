import { useState } from "react";
import { Bot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAgents, useDeleteAgent, type Agent } from "@/hooks/useAgents";
import { CreateAgentDialog } from "@/components/ai-agent/CreateAgentDialog";
import { AgentCard } from "@/components/ai-agent/AgentCard";
import { AgentTestPanel } from "@/components/ai-agent/AgentTestPanel";
import { AgentTestCall } from "@/components/ai-agent/AgentTestCall";
import { useAuth } from "@/hooks/useAuthContext";
import { toast } from "@/hooks/use-toast";

export default function Agents() {
  const { orgId } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testAgent, setTestAgent] = useState<Agent | null>(null);
  const [testCallAgent, setTestCallAgent] = useState<Agent | null>(null);
  const { data: agents = [], isLoading } = useAgents(orgId || undefined);
  const deleteAgent = useDeleteAgent();

  const handleDelete = async (agentId: string) => {
    try {
      await deleteAgent.mutateAsync(agentId);
      toast({ title: "Agent deleted" });
    } catch {
      toast({ title: "Failed to delete agent", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Agents</h1>
          <p className="mt-1 text-muted-foreground">Create and manage your AI voice agents.</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />New Agent</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : !agents.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Bot className="h-7 w-7 text-primary" /></div>
            <h3 className="mt-4 font-display text-lg font-semibold">Create your first agent</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">Set up a 24/7 AI voice agent that qualifies buyers, books showings, and sends you only ready-to-buy leads.</p>
            <Button className="mt-6 gap-2" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" />Create Agent</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => <AgentCard key={agent.id} agent={agent} onTest={setTestAgent} onTestCall={setTestCallAgent} onDelete={handleDelete} />)}
        </div>
      )}

      <CreateAgentDialog open={dialogOpen} onOpenChange={setDialogOpen} orgId={orgId || ""} />
      {testAgent && <AgentTestPanel agent={testAgent} onClose={() => setTestAgent(null)} />}
      {testCallAgent && <AgentTestCall agent={testCallAgent} onClose={() => setTestCallAgent(null)} />}
    </div>
  );
}
