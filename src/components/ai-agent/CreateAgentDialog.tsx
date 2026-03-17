import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Rocket, Bot, PhoneOutgoing } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateRetellAgent, type CreateAgentPayload } from "@/hooks/useCreateRetellAgent";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const inboundSchema = z.object({
  agent_name: z.string().min(1, "Agent name is required").max(100),
  company_name: z.string().min(1, "Company name is required").max(100),
  service_areas: z.string().min(1, "At least one service area is required").max(500),
  voice_persona: z.string().min(1, "Select a voice persona"),
  min_budget: z.string().optional(),
  timeline_threshold: z.string().default("0-3"),
  require_pre_approval: z.boolean().default(false),
  auto_schedule: z.boolean().default(false),
  calendly_link: z.string().max(500).optional(),
  phone_number: z.string().max(20).optional(),
  forwarding_number: z.string().max(20).optional(),
});

const outboundSchema = z.object({
  agent_name: z.string().min(1, "Agent name is required").max(100),
  company_name: z.string().min(1, "Company name is required").max(100),
  voice_persona: z.string().min(1, "Select a voice persona"),
  phone_number: z.string().max(20).optional(),
  forwarding_number: z.string().max(20).optional(),
  outbound_goal: z.string().min(1, "Describe the agent's goal").max(500),
});

type InboundValues = z.infer<typeof inboundSchema>;
type OutboundValues = z.infer<typeof outboundSchema>;

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

type AgentType = "inbound" | "outbound";

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateAgentDialog({ open, onOpenChange, orgId }: CreateAgentDialogProps) {
  const [agentType, setAgentType] = useState<AgentType | null>(null);
  const [step, setStep] = useState(0);
  const createAgent = useCreateRetellAgent();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      createAgent.reset();
      inboundForm.reset();
      outboundForm.reset();
      setStep(0);
      setAgentType(null);
    }
    onOpenChange(isOpen);
  };

  // ── Inbound form ──────────────────────────────────────────────────────────
  const inboundForm = useForm<InboundValues>({
    resolver: zodResolver(inboundSchema),
    defaultValues: {
      agent_name: "", company_name: "", service_areas: "", voice_persona: "friendly_professional",
      min_budget: "", timeline_threshold: "0-3", require_pre_approval: false, auto_schedule: false,
      calendly_link: "", phone_number: "", forwarding_number: "",
    },
  });

  // ── Outbound form ─────────────────────────────────────────────────────────
  const outboundForm = useForm<OutboundValues>({
    resolver: zodResolver(outboundSchema),
    defaultValues: {
      agent_name: "", company_name: "", voice_persona: "friendly_professional",
      phone_number: "", forwarding_number: "", outbound_goal: "",
    },
  });

  // ── Steps ─────────────────────────────────────────────────────────────────
  const inboundSteps = [
    { title: "Company Info", description: "Tell us about your business" },
    { title: "Qualification Rules", description: "Set lead qualification criteria" },
    { title: "Voice & Calendar", description: "Configure voice and scheduling" },
    { title: "Phone Routing", description: "Optional phone configuration" },
  ];

  const outboundSteps = [
    { title: "Agent Info", description: "Name and company details" },
    { title: "Call Configuration", description: "Voice and phone settings" },
  ];

  const steps = agentType === "outbound" ? outboundSteps : inboundSteps;

  // ── Resolve org id ────────────────────────────────────────────────────────
  async function resolveOrgId(): Promise<string | null> {
    if (orgId) return orgId;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).limit(1).maybeSingle();
        if (data?.org_id) return data.org_id;
        const { data: rpcData } = await supabase.rpc("get_user_org_ids", { _user_id: user.id });
        if (rpcData && Array.isArray(rpcData) && rpcData.length > 0) return rpcData[0];
      }
    } catch (e) { console.error("[CreateAgentDialog] org fetch error:", e); }
    return null;
  }

  // ── Submit inbound ────────────────────────────────────────────────────────
  async function onInboundSubmit(values: InboundValues) {
    if (step !== inboundSteps.length - 1) { setStep(step + 1); return; }

    const resolvedOrgId = await resolveOrgId();
    if (!resolvedOrgId) {
      toast({ title: "Organization not loaded", description: "Please log out and log back in.", variant: "destructive" });
      return;
    }

    const payload: CreateAgentPayload = {
      agent_name: values.agent_name,
      company_name: values.company_name,
      service_areas: values.service_areas.split(",").map((s) => s.trim()).filter(Boolean),
      voice_persona: values.voice_persona,
      min_budget: values.min_budget ? Number(values.min_budget) : null,
      timeline_threshold: values.timeline_threshold,
      require_pre_approval: values.require_pre_approval,
      auto_schedule: values.auto_schedule,
      calendly_link: values.calendly_link || "",
      phone_number: values.phone_number || "",
      forwarding_number: values.forwarding_number || "",
      org_id: resolvedOrgId,
      category: "inbound",
    };

    try {
      await createAgent.mutateAsync(payload);
      toast({ title: "Inbound agent published! 🚀", description: "Your AI voice agent is live and ready to take calls." });
      handleOpenChange(false);
    } catch (err: unknown) {
      toast({ title: "Failed to create agent", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    }
  }

  // ── Submit outbound ───────────────────────────────────────────────────────
  async function onOutboundSubmit(values: OutboundValues) {
    if (step !== outboundSteps.length - 1) { setStep(step + 1); return; }

    const resolvedOrgId = await resolveOrgId();
    if (!resolvedOrgId) {
      toast({ title: "Organization not loaded", description: "Please log out and log back in.", variant: "destructive" });
      return;
    }

    const payload: CreateAgentPayload = {
      agent_name: values.agent_name,
      company_name: values.company_name,
      service_areas: [],
      voice_persona: values.voice_persona,
      min_budget: null,
      timeline_threshold: "0-3",
      require_pre_approval: false,
      auto_schedule: false,
      calendly_link: "",
      phone_number: values.phone_number || "",
      forwarding_number: values.forwarding_number || "",
      org_id: resolvedOrgId,
      category: "outbound",
      outbound_goal: values.outbound_goal,
    };

    try {
      await createAgent.mutateAsync(payload);
      toast({ title: "Outbound agent published! 📞", description: "Your outbound agent is ready to make calls." });
      handleOpenChange(false);
    } catch (err: unknown) {
      toast({ title: "Failed to create agent", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    }
  }

  const inboundCanProceed = () => {
    switch (step) {
      case 0: return inboundForm.watch("agent_name") && inboundForm.watch("company_name") && inboundForm.watch("service_areas");
      case 1: return true;
      case 2: return !!inboundForm.watch("voice_persona");
      case 3: return true;
      default: return true;
    }
  };

  const outboundCanProceed = () => {
    switch (step) {
      case 0: return outboundForm.watch("agent_name") && outboundForm.watch("company_name") && outboundForm.watch("outbound_goal");
      case 1: return !!outboundForm.watch("voice_persona");
      default: return true;
    }
  };

  // ─── Render: type selection ───────────────────────────────────────────────
  if (!agentType) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Choose Agent Type</DialogTitle>
            <DialogDescription>What kind of AI voice agent do you want to create?</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={() => { setAgentType("inbound"); setStep(0); }}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-left transition-all hover:border-primary hover:bg-primary/5",
                "border-border"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Inbound</p>
                <p className="text-xs text-muted-foreground mt-0.5">Answers incoming calls, qualifies buyers, books showings</p>
              </div>
            </button>

            <button
              onClick={() => { setAgentType("outbound"); setStep(0); }}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-left transition-all hover:border-primary hover:bg-primary/5",
                "border-border"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <PhoneOutgoing className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Outbound</p>
                <p className="text-xs text-muted-foreground mt-0.5">Makes outbound calls to leads from your CRM or Airtable</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Render: inbound form ─────────────────────────────────────────────────
  if (agentType === "inbound") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => setAgentType(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back</button>
              <span className="text-xs text-muted-foreground">Inbound Agent</span>
            </div>
            <DialogTitle className="font-display text-xl">{inboundSteps[step].title}</DialogTitle>
            <DialogDescription>{inboundSteps[step].description}</DialogDescription>
          </DialogHeader>

          <div className="flex gap-1.5 mb-2">
            {inboundSteps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          <form onSubmit={inboundForm.handleSubmit(onInboundSubmit)} className="space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input placeholder="Acme Realty Group" {...inboundForm.register("company_name")} />
                  {inboundForm.formState.errors.company_name && <p className="text-sm text-destructive">{inboundForm.formState.errors.company_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Agent Name</Label>
                  <Input placeholder="Sarah Johnson" {...inboundForm.register("agent_name")} />
                  {inboundForm.formState.errors.agent_name && <p className="text-sm text-destructive">{inboundForm.formState.errors.agent_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Service Areas</Label>
                  <Textarea placeholder="Beverly Hills, Santa Monica, West Hollywood" className="min-h-[80px]" {...inboundForm.register("service_areas")} />
                  <p className="text-xs text-muted-foreground">Comma-separated list of areas</p>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Minimum Budget ($)</Label>
                  <Input type="number" placeholder="200000" {...inboundForm.register("min_budget")} />
                  <p className="text-xs text-muted-foreground">Leave empty for no minimum</p>
                </div>
                <div className="space-y-2">
                  <Label>Hot Lead Timeline Threshold</Label>
                  <Select value={inboundForm.watch("timeline_threshold")} onValueChange={(val) => inboundForm.setValue("timeline_threshold", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-3">0–3 months (Urgent)</SelectItem>
                      <SelectItem value="3-6">3–6 months (Active)</SelectItem>
                      <SelectItem value="6-12">6–12 months (Planning)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div><Label>Require Pre-Approval</Label><p className="text-xs text-muted-foreground">Only hot-classify pre-approved buyers</p></div>
                  <Switch checked={inboundForm.watch("require_pre_approval")} onCheckedChange={(val) => inboundForm.setValue("require_pre_approval", val)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div><Label>Auto-Schedule Showings</Label><p className="text-xs text-muted-foreground">Let the AI book appointments directly</p></div>
                  <Switch checked={inboundForm.watch("auto_schedule")} onCheckedChange={(val) => inboundForm.setValue("auto_schedule", val)} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Voice Persona</Label>
                  <Select value={inboundForm.watch("voice_persona")} onValueChange={(val) => inboundForm.setValue("voice_persona", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly_professional">🤝 Friendly Professional</SelectItem>
                      <SelectItem value="confident_expert">💼 Confident Expert</SelectItem>
                      <SelectItem value="warm_concierge">🏡 Warm Concierge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Calendly Link (optional)</Label>
                  <Input placeholder="https://calendly.com/your-link" {...inboundForm.register("calendly_link")} />
                  <p className="text-xs text-muted-foreground">Used for booking showings</p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Phone Number (optional)</Label>
                  <Input placeholder="+1 (555) 123-4567" {...inboundForm.register("phone_number")} />
                </div>
                <div className="space-y-2">
                  <Label>Forwarding Destination (optional)</Label>
                  <Input placeholder="+1 (555) 987-6543" {...inboundForm.register("forwarding_number")} />
                  <p className="text-xs text-muted-foreground">Where to route escalated calls</p>
                </div>
              </>
            )}

            <div className="flex justify-between pt-2">
              {step > 0
                ? <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
                : <div />
              }
              {step < inboundSteps.length - 1 ? (
                <Button type="button" onClick={() => setStep(step + 1)} disabled={!inboundCanProceed()}>Continue</Button>
              ) : (
                <Button type="submit" disabled={createAgent.isPending} className="gap-2">
                  {createAgent.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Publishing...</> : <><Rocket className="h-4 w-4" />Create & Publish</>}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Render: outbound form ────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => setAgentType(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back</button>
            <span className="text-xs text-muted-foreground">Outbound Agent</span>
          </div>
          <DialogTitle className="font-display text-xl">{outboundSteps[step].title}</DialogTitle>
          <DialogDescription>{outboundSteps[step].description}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1.5 mb-2">
          {outboundSteps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <form onSubmit={outboundForm.handleSubmit(onOutboundSubmit)} className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="Acme Insurance Group" {...outboundForm.register("company_name")} />
                {outboundForm.formState.errors.company_name && <p className="text-sm text-destructive">{outboundForm.formState.errors.company_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Agent Name</Label>
                <Input placeholder="Sarah Smith" {...outboundForm.register("agent_name")} />
                {outboundForm.formState.errors.agent_name && <p className="text-sm text-destructive">{outboundForm.formState.errors.agent_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Agent Goal</Label>
                <Textarea
                  placeholder="Follow up with insurance leads, qualify interest level, and transfer hot leads to a human advisor."
                  className="min-h-[100px]"
                  {...outboundForm.register("outbound_goal")}
                />
                <p className="text-xs text-muted-foreground">Describe what this agent should accomplish on each call</p>
                {outboundForm.formState.errors.outbound_goal && <p className="text-sm text-destructive">{outboundForm.formState.errors.outbound_goal.message}</p>}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Voice Persona</Label>
                <Select value={outboundForm.watch("voice_persona")} onValueChange={(val) => outboundForm.setValue("voice_persona", val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly_professional">🤝 Friendly Professional</SelectItem>
                    <SelectItem value="confident_expert">💼 Confident Expert</SelectItem>
                    <SelectItem value="warm_concierge">🏡 Warm Concierge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>From Phone Number (optional)</Label>
                <Input placeholder="+15551234567" {...outboundForm.register("phone_number")} />
                <p className="text-xs text-muted-foreground">The Retell number that calls will originate from</p>
              </div>
              <div className="space-y-2">
                <Label>Transfer Number (optional)</Label>
                <Input placeholder="+15559876543" {...outboundForm.register("forwarding_number")} />
                <p className="text-xs text-muted-foreground">Where to transfer hot leads to a human</p>
              </div>
            </>
          )}

          <div className="flex justify-between pt-2">
            {step > 0
              ? <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
              : <div />
            }
            {step < outboundSteps.length - 1 ? (
              <Button type="button" onClick={() => setStep(step + 1)} disabled={!outboundCanProceed()}>Continue</Button>
            ) : (
              <Button type="submit" disabled={createAgent.isPending} className="gap-2">
                {createAgent.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Publishing...</> : <><Rocket className="h-4 w-4" />Create & Publish</>}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
