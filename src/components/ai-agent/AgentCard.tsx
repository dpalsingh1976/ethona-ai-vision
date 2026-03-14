import { useState } from "react";
import { Bot, MoreVertical, Trash2, Eye, Phone, PhoneOutgoing } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Agent } from "@/hooks/useAgents";
import { LaunchCallDialog } from "./LaunchCallDialog";

const PERSONA_LABELS: Record<string, string> = {
  friendly_professional: "🤝 Friendly Professional",
  confident_expert: "💼 Confident Expert",
  warm_concierge: "🏡 Warm Concierge",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  paused: "outline",
  archived: "outline",
};

interface AgentCardProps {
  agent: Agent;
  onTest: (agent: Agent) => void;
  onTestCall: (agent: Agent) => void;
  onDelete: (agentId: string) => void;
}

export function AgentCard({ agent, onTest, onTestCall, onDelete }: AgentCardProps) {
  const [launchOpen, setLaunchOpen] = useState(false);
  const isOutbound = agent.category === "outbound";

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                {isOutbound ? (
                  <PhoneOutgoing className="h-5 w-5 text-primary" />
                ) : (
                  <Bot className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold truncate">{agent.name}</h3>
                  {isOutbound && (
                    <Badge variant="outline" className="text-xs shrink-0 border-primary/40 text-primary">
                      Outbound
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {PERSONA_LABELS[agent.voice_persona || ""] || agent.voice_persona}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANTS[agent.status] || "secondary"}>{agent.status}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isOutbound && (
                    <DropdownMenuItem onClick={() => onTestCall(agent)}>
                      <Phone className="mr-2 h-4 w-4" />
                      Test Call
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onTest(agent)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Flow
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(agent.id)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Retell ID</span>
              <p className="font-mono truncate">{agent.retell_agent_id || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Published</span>
              <p>{agent.last_published_at ? new Date(agent.last_published_at).toLocaleDateString() : "—"}</p>
            </div>
          </div>

          {isOutbound && agent.retell_agent_id && (
            <Button
              className="mt-4 w-full gap-2"
              size="sm"
              onClick={() => setLaunchOpen(true)}
            >
              <PhoneOutgoing className="h-4 w-4" />
              Launch Call
            </Button>
          )}
        </CardContent>
      </Card>

      <LaunchCallDialog
        open={launchOpen}
        onOpenChange={setLaunchOpen}
        agent={agent}
      />
    </>
  );
}
