import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Rocket } from "lucide-react";
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

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

export function CreateAgentDialog({ open, onOpenChange, orgId }: CreateAgentDialogProps) {
  const [step, setStep] = useState(0);
  const createAgent = useCreateRetellAgent();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      createAgent.reset();
      form.reset();
      setStep(0);
    }
    onOpenChange(isOpen);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agent_name: "", company_name: "", service_areas: "", voice_persona: "friendly_professional",
      min_budget: "", timeline_threshold: "0-3", require_pre_approval: false, auto_schedule: false,
      calendly_link: "", phone_number: "", forwarding_number: "",
    },
  });

  const steps = [
    { title: "Company Info", description: "Tell us about your business" },
    { title: "Qualification Rules", description: "Set lead qualification criteria" },
    { title: "Voice & Calendar", description: "Configure voice and scheduling" },
    { title: "Phone Routing", description: "Optional phone configuration" },
  ];

  async function onSubmit(values: FormValues) {
    if (step !== steps.length - 1) { setStep(step + 1); return; }

    let resolvedOrgId = orgId;
    if (!resolvedOrgId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("org_members").select("org_id").eq("user_id", user.id).limit(1).maybeSingle();
          if (data?.org_id) resolvedOrgId = data.org_id;
          if (!resolvedOrgId) {
            const { data: rpcData } = await supabase.rpc("get_user_org_ids", { _user_id: user.id });
            if (rpcData && Array.isArray(rpcData) && rpcData.length > 0) resolvedOrgId = rpcData[0];
          }
        }
      } catch (e) { console.error("[CreateAgentDialog] org fetch error:", e); }
    }

    if (!resolvedOrgId) {
      toast({ title: "Organization not loaded", description: "Please log out and log back in, then try again.", variant: "destructive" });
      return;
    }

    const payload: CreateAgentPayload = {
      agent_name: values.agent_name, company_name: values.company_name,
      service_areas: values.service_areas.split(",").map((s) => s.trim()).filter(Boolean),
      voice_persona: values.voice_persona, min_budget: values.min_budget ? Number(values.min_budget) : null,
      timeline_threshold: values.timeline_threshold, require_pre_approval: values.require_pre_approval,
      auto_schedule: values.auto_schedule, calendly_link: values.calendly_link || "",
      phone_number: values.phone_number || "", forwarding_number: values.forwarding_number || "",
      org_id: resolvedOrgId,
    };

    try {
      await createAgent.mutateAsync(payload);
      toast({ title: "Agent published! 🚀", description: "Your AI voice agent is now live and ready to take calls." });
      onOpenChange(false);
      createAgent.reset(); form.reset(); setStep(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Failed to create agent", description: message, variant: "destructive" });
    }
  }

  const canProceed = () => {
    switch (step) {
      case 0: return form.watch("agent_name") && form.watch("company_name") && form.watch("service_areas");
      case 1: return true;
      case 2: return !!form.watch("voice_persona");
      case 3: return true;
      default: return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{steps[step].title}</DialogTitle>
          <DialogDescription>{steps[step].description}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1.5 mb-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input id="company_name" placeholder="Acme Realty Group" {...form.register("company_name")} />
                {form.formState.errors.company_name && <p className="text-sm text-destructive">{form.formState.errors.company_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent_name">Agent Name</Label>
                <Input id="agent_name" placeholder="Sarah Johnson" {...form.register("agent_name")} />
                {form.formState.errors.agent_name && <p className="text-sm text-destructive">{form.formState.errors.agent_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_areas">Service Areas</Label>
                <Textarea id="service_areas" placeholder="Beverly Hills, Santa Monica, West Hollywood" className="min-h-[80px]" {...form.register("service_areas")} />
                <p className="text-xs text-muted-foreground">Comma-separated list of areas</p>
                {form.formState.errors.service_areas && <p className="text-sm text-destructive">{form.formState.errors.service_areas.message}</p>}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="min_budget">Minimum Budget ($)</Label>
                <Input id="min_budget" type="number" placeholder="200000" {...form.register("min_budget")} />
                <p className="text-xs text-muted-foreground">Leave empty for no minimum</p>
              </div>
              <div className="space-y-2">
                <Label>Hot Lead Timeline Threshold</Label>
                <Select value={form.watch("timeline_threshold")} onValueChange={(val) => form.setValue("timeline_threshold", val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3">0–3 months (Urgent)</SelectItem>
                    <SelectItem value="3-6">3–6 months (Active)</SelectItem>
                    <SelectItem value="6-12">6–12 months (Planning)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label>Require Pre-Approval</Label>
                  <p className="text-xs text-muted-foreground">Only hot-classify pre-approved buyers</p>
                </div>
                <Switch checked={form.watch("require_pre_approval")} onCheckedChange={(val) => form.setValue("require_pre_approval", val)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label>Auto-Schedule Showings</Label>
                  <p className="text-xs text-muted-foreground">Let the AI book appointments directly</p>
                </div>
                <Switch checked={form.watch("auto_schedule")} onCheckedChange={(val) => form.setValue("auto_schedule", val)} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Voice Persona</Label>
                <Select value={form.watch("voice_persona")} onValueChange={(val) => form.setValue("voice_persona", val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly_professional">🤝 Friendly Professional</SelectItem>
                    <SelectItem value="confident_expert">💼 Confident Expert</SelectItem>
                    <SelectItem value="warm_concierge">🏡 Warm Concierge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="calendly_link">Calendly Link (optional)</Label>
                <Input id="calendly_link" placeholder="https://calendly.com/your-link" {...form.register("calendly_link")} />
                <p className="text-xs text-muted-foreground">Used for booking showings</p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number (optional)</Label>
                <Input id="phone_number" placeholder="+1 (555) 123-4567" {...form.register("phone_number")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="forwarding_number">Forwarding Destination (optional)</Label>
                <Input id="forwarding_number" placeholder="+1 (555) 987-6543" {...form.register("forwarding_number")} />
                <p className="text-xs text-muted-foreground">Where to route escalated calls</p>
              </div>
            </>
          )}

          <div className="flex justify-between pt-2">
            {step > 0 ? <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button> : <div />}
            {step < steps.length - 1 ? (
              <Button type="button" onClick={() => setStep(step + 1)} disabled={!canProceed()}>Continue</Button>
            ) : (
              <Button type="submit" disabled={createAgent.isPending} className="gap-2">
                {createAgent.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" />Publishing...</>) : (<><Rocket className="h-4 w-4" />Create & Publish Agent</>)}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
