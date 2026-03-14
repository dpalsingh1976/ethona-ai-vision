import { useState, useEffect } from "react";
import { PhoneOutgoing, Search, Loader2, Phone, User, ArrowRightLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { Agent } from "@/hooks/useAgents";
import { supabase } from "@/integrations/supabase/client";

function normalizePhone(raw: string): string {
  if (!raw) return raw;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length > 7) return `+${digits}`;
  return raw;
}

interface AirtableLead {
  id: string;
  first_name: string;
  last_name: string;
  to_phone_number: string;
  from_phone_number: string;
  lead_source: string;
  original_interest: string;
  advisor_name: string;
  status: string;
}

interface LaunchCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent;
}

export function LaunchCallDialog({ open, onOpenChange, agent }: LaunchCallDialogProps) {
  const [leads, setLeads] = useState<AirtableLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<AirtableLead | null>(null);
  const [manualPhone, setManualPhone] = useState("");
  const [manualFromPhone, setManualFromPhone] = useState(agent.phone_number || "");
  const [calling, setCalling] = useState(false);
  const [nextOffset, setNextOffset] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => fetchLeads(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [open, search]);

  const fetchLeads = async (offset?: string) => {
    setLoadingLeads(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = new URL(`https://${projectId}.supabase.co/functions/v1/fetch-airtable-leads`);
      if (search) url.searchParams.set("search", search);
      if (offset) url.searchParams.set("offset", offset);

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch leads");

      if (offset) {
        setLeads((prev) => [...prev, ...(data.leads || [])]);
      } else {
        setLeads(data.leads || []);
      }
      setNextOffset(data.offset || null);
    } catch (err) {
      toast({ title: "Failed to load leads", description: String(err), variant: "destructive" });
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleCall = async (toNumber: string, fromNumber: string) => {
    if (!fromNumber.trim()) {
      toast({ title: "From number required", description: "No from_phone_number found for this lead.", variant: "destructive" });
      return;
    }
    if (!toNumber.trim()) {
      toast({ title: "To number required", description: "Select a lead or enter a phone number.", variant: "destructive" });
      return;
    }

    setCalling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/initiate-outbound-call`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token || ""}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_id: agent.retell_agent_id,
            from_number: fromNumber.trim(),
            to_number: toNumber.trim(),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Call failed");

      toast({
        title: "📞 Call initiated!",
        description: `Call ID: ${data.call_id || "pending"}`,
      });
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Failed to initiate call", description: String(err), variant: "destructive" });
    } finally {
      setCalling(false);
    }
  };

  const fullName = (lead: AirtableLead) =>
    [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneOutgoing className="h-5 w-5 text-primary" />
            Launch Outbound Call
          </DialogTitle>
          <DialogDescription>
            Agent: <span className="font-medium text-foreground">{agent.name}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="airtable">
          <TabsList className="w-full">
            <TabsTrigger value="airtable" className="flex-1">From Airtable</TabsTrigger>
            <TabsTrigger value="manual" className="flex-1">Manual Number</TabsTrigger>
          </TabsList>

          {/* Airtable tab */}
          <TabsContent value="airtable" className="space-y-3 mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone…"
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedLead(null); }}
              />
            </div>

            <div className="h-56 overflow-y-auto rounded-md border bg-muted/30 p-1 space-y-0.5">
              {loadingLeads && leads.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : leads.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No leads found
                </div>
              ) : (
                <>
                  {leads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLead({ ...lead, from_phone_number: normalizePhone(lead.from_phone_number) })}
                      className={`w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-background ${
                        selectedLead?.id === lead.id ? "bg-background ring-1 ring-primary/40" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="font-medium text-sm truncate">{fullName(lead)}</span>
                        </div>
                        {lead.status && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {lead.status}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 pl-5 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 text-primary/60" />
                          <span className="font-medium text-foreground/70">To:</span>
                          <span>{lead.to_phone_number || "—"}</span>
                          {lead.original_interest && (
                            <span className="truncate">· {lead.original_interest}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ArrowRightLeft className="h-3 w-3 text-primary/60" />
                          <span className="font-medium text-foreground/70">From:</span>
                          <span>{lead.from_phone_number || "—"}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                  {nextOffset && (
                    <button
                      onClick={() => fetchLeads(nextOffset)}
                      className="w-full py-2 text-center text-xs text-primary hover:underline"
                    >
                      {loadingLeads ? <Loader2 className="h-3 w-3 animate-spin inline" /> : "Load more"}
                    </button>
                  )}
                </>
              )}
            </div>

            {selectedLead && (
              <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs space-y-1">
                <p className="font-medium text-foreground">{fullName(selectedLead)}</p>
                <p className="text-muted-foreground">
                  Calling <span className="text-foreground">{selectedLead.to_phone_number}</span> from{" "}
                  <span className="text-foreground">{selectedLead.from_phone_number}</span>
                </p>
              </div>
            )}

            <Button
              className="w-full gap-2"
              disabled={!selectedLead || calling}
              onClick={() => selectedLead && handleCall(selectedLead.to_phone_number, selectedLead.from_phone_number)}
            >
              {calling ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneOutgoing className="h-4 w-4" />}
              {selectedLead ? `Call ${fullName(selectedLead)}` : "Select a lead to call"}
            </Button>
          </TabsContent>

          {/* Manual tab */}
          <TabsContent value="manual" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label htmlFor="manual-from">From Number (your Retell number)</Label>
              <Input
                id="manual-from"
                placeholder="+15551234567"
                value={manualFromPhone}
                onChange={(e) => setManualFromPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="manual-phone">To Number (lead's phone)</Label>
              <Input
                id="manual-phone"
                placeholder="+15559876543"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter phone numbers in E.164 format (e.g. +15551234567).
              </p>
            </div>
            <Button
              className="w-full gap-2"
              disabled={!manualPhone.trim() || !manualFromPhone.trim() || calling}
              onClick={() => handleCall(manualPhone, manualFromPhone)}
            >
              {calling ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneOutgoing className="h-4 w-4" />}
              Initiate Call
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
