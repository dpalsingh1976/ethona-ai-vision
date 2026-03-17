import { useState, useEffect, useRef } from "react";
import { PhoneOutgoing, Search, Loader2, Phone, User, ArrowRightLeft, CheckSquare, Square, CheckCircle2, XCircle, PhoneCall } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

interface BatchResult {
  name: string;
  success: boolean;
  error?: string;
}

interface BatchProgress {
  current: number;
  total: number;
  results: BatchResult[];
  done: boolean;
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [manualPhone, setManualPhone] = useState("");
  const [manualFromPhone, setManualFromPhone] = useState(agent.phone_number || "");
  const [calling, setCalling] = useState(false);
  const [nextOffset, setNextOffset] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      setBatchProgress(null);
      abortRef.current = false;
      return;
    }
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

  const initiateCall = async (toNumber: string, fromNumber: string): Promise<void> => {
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
  };

  const handleSingleCall = async (toNumber: string, fromNumber: string) => {
    if (!fromNumber.trim()) {
      toast({ title: "From number required", variant: "destructive" });
      return;
    }
    if (!toNumber.trim()) {
      toast({ title: "To number required", variant: "destructive" });
      return;
    }
    setCalling(true);
    try {
      await initiateCall(toNumber, fromNumber);
      toast({ title: "📞 Call initiated!", description: `Calling ${toNumber}` });
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Failed to initiate call", description: String(err), variant: "destructive" });
    } finally {
      setCalling(false);
    }
  };

  const handleBatchCall = async () => {
    const toCall = leads.filter((l) => selectedIds.has(l.id));
    if (toCall.length === 0) return;

    abortRef.current = false;
    setBatchProgress({ current: 0, total: toCall.length, results: [], done: false });
    setCalling(true);

    const results: BatchResult[] = [];

    for (let i = 0; i < toCall.length; i++) {
      if (abortRef.current) break;

      const lead = toCall[i];
      setBatchProgress({ current: i + 1, total: toCall.length, results: [...results], done: false });

      try {
        await initiateCall(
          normalizePhone(lead.to_phone_number),
          normalizePhone(lead.from_phone_number)
        );
        results.push({ name: fullName(lead), success: true });
      } catch (err) {
        results.push({ name: fullName(lead), success: false, error: String(err) });
      }

      setBatchProgress({ current: i + 1, total: toCall.length, results: [...results], done: false });

      if (i < toCall.length - 1 && !abortRef.current) {
        await sleep(5000);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    setBatchProgress({ current: toCall.length, total: toCall.length, results, done: true });
    setCalling(false);

    toast({
      title: `Batch calling complete`,
      description: `${successCount} initiated${failCount > 0 ? `, ${failCount} failed` : ""}`,
      variant: failCount > 0 ? "destructive" : "default",
    });
  };

  const toggleLead = (lead: AirtableLead) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(lead.id) ? next.delete(lead.id) : next.add(lead.id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === leads.length && leads.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };

  const fullName = (lead: AirtableLead) =>
    [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Unknown";

  const selectedLeads = leads.filter((l) => selectedIds.has(l.id));
  const allSelected = leads.length > 0 && selectedIds.size === leads.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const ctaLabel = () => {
    if (selectedIds.size === 0) return "Select leads to call";
    if (selectedIds.size === 1) return `Call ${fullName(selectedLeads[0])}`;
    return `Call ${selectedIds.size} Leads in Sequence`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v && calling) {
        abortRef.current = true;
      }
      onOpenChange(v);
    }}>
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

            {/* Batch progress overlay */}
            {batchProgress && (
              <div className="rounded-md border bg-muted/20 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {batchProgress.done ? "Batch calling complete" : `Calling lead ${batchProgress.current} of ${batchProgress.total}…`}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {batchProgress.current}/{batchProgress.total}
                  </span>
                </div>
                <Progress value={(batchProgress.current / batchProgress.total) * 100} className="h-2" />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {batchProgress.results.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {r.success
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        : <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      }
                      <span className={r.success ? "text-foreground" : "text-muted-foreground"}>{r.name}</span>
                      {r.error && <span className="text-destructive truncate">— {r.error}</span>}
                    </div>
                  ))}
                  {!batchProgress.done && batchProgress.current <= batchProgress.total && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                      <span>
                        {batchProgress.current <= batchProgress.results.length
                          ? "Waiting 5s before next call…"
                          : `Calling ${fullName(leads.filter(l => selectedIds.has(l.id))[batchProgress.current - 1] || leads[0])}…`}
                      </span>
                    </div>
                  )}
                </div>
                {batchProgress.done && (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => {
                    setBatchProgress(null);
                    setSelectedIds(new Set());
                    onOpenChange(false);
                  }}>
                    Close
                  </Button>
                )}
              </div>
            )}

            {!batchProgress && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone…"
                    className="pl-9"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setSelectedIds(new Set()); }}
                  />
                </div>

                {/* Select All row */}
                {leads.length > 0 && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={toggleAll}
                  >
                    <Checkbox
                      checked={allSelected}
                      data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                      className="pointer-events-none"
                    />
                    <span className="text-xs text-muted-foreground flex-1">
                      {allSelected ? "Deselect all" : `Select all (${leads.length})`}
                    </span>
                    {selectedIds.size > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedIds.size} selected
                      </Badge>
                    )}
                  </div>
                )}

                <div className="h-52 overflow-y-auto rounded-md border bg-muted/30 p-1 space-y-0.5">
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
                          onClick={() => toggleLead(lead)}
                          className={`w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-background ${
                            selectedIds.has(lead.id) ? "bg-background ring-1 ring-primary/40" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Checkbox
                                checked={selectedIds.has(lead.id)}
                                className="pointer-events-none shrink-0"
                              />
                              <span className="font-medium text-sm truncate">{fullName(lead)}</span>
                            </div>
                            {lead.status && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                {lead.status}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 pl-6 space-y-0.5">
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

                <Button
                  className="w-full gap-2"
                  disabled={selectedIds.size === 0 || calling}
                  onClick={() => {
                    if (selectedIds.size === 1) {
                      const lead = selectedLeads[0];
                      handleSingleCall(
                        normalizePhone(lead.to_phone_number),
                        normalizePhone(lead.from_phone_number)
                      );
                    } else {
                      handleBatchCall();
                    }
                  }}
                >
                  {calling ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneOutgoing className="h-4 w-4" />}
                  {ctaLabel()}
                </Button>
              </>
            )}
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
              onClick={() => handleSingleCall(manualPhone, manualFromPhone)}
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
