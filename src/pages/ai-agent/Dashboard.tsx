import { useState } from "react";
import {
  Phone, Users, CalendarDays, DollarSign, Clock,
  PhoneOutgoing, PhoneCall, PhoneMissed, PhoneOff,
  TrendingUp, ChevronDown, ChevronUp, Flame, Thermometer, Snowflake,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuthContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useOutboundCallResults, OutboundCallRecord } from "@/hooks/useOutboundCallResults";
import { CallTranscriptDialog } from "@/components/ai-agent/CallTranscriptDialog";
import { cn } from "@/lib/utils";

function scoreBadge(score: string | null) {
  switch (score) {
    case "HOT": return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Hot</Badge>;
    case "WARM": return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Warm</Badge>;
    case "COLD": return <Badge className="bg-primary/20 text-primary border-primary/30">Cold</Badge>;
    default: return <Badge variant="secondary">{score || "—"}</Badge>;
  }
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatCurrency(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

function callStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case "answered":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/25">
          <PhoneCall className="h-3 w-3" /> Answered
        </span>
      );
    case "voicemail":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/25">
          <PhoneOff className="h-3 w-3" /> Voicemail
        </span>
      );
    case "no_answer":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive border border-destructive/25">
          <PhoneMissed className="h-3 w-3" /> No Answer
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border">
          Unknown
        </span>
      );
  }
}

function interestBadge(level: string) {
  switch (level?.toLowerCase()) {
    case "high":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-semibold text-orange-400 border border-orange-500/25">
          <Flame className="h-3 w-3" /> High
        </span>
      );
    case "medium":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-xs font-semibold text-yellow-400 border border-yellow-500/25">
          <Thermometer className="h-3 w-3" /> Medium
        </span>
      );
    case "low":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-400 border border-sky-500/25">
          <Snowflake className="h-3 w-3" /> Low
        </span>
      );
    default:
      return <span className="text-muted-foreground text-xs">—</span>;
  }
}

function formatLastCalled(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function ExpandableRow({ record }: { record: OutboundCallRecord }) {
  const [open, setOpen] = useState(false);
  const name = [record.first_name, record.last_name].filter(Boolean).join(" ") || "Unknown";

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-accent/40 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <span>{name}</span>
            {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{record.to_phone_number}</div>
        </TableCell>
        <TableCell>{callStatusBadge(record.call_status)}</TableCell>
        <TableCell>{interestBadge(record.interest_level)}</TableCell>
        <TableCell className="max-w-[200px]">
          <span className="text-sm text-foreground/80 line-clamp-1">{record.next_action || "—"}</span>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatLastCalled(record.last_called)}</TableCell>
      </TableRow>
      {open && (record.notes || record.timeline || record.original_interest) && (
        <TableRow className="bg-muted/30 hover:bg-muted/40">
          <TableCell colSpan={5} className="py-3 px-4">
            <div className="grid gap-2 sm:grid-cols-3 text-sm">
              {record.original_interest && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Interest</p>
                  <p className="text-foreground/80">{record.original_interest}</p>
                </div>
              )}
              {record.timeline && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Timeline</p>
                  <p className="text-foreground/80">{record.timeline}</p>
                </div>
              )}
              {record.notes && (
                <div className={cn(!record.original_interest && !record.timeline ? "sm:col-span-3" : "")}>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> AI Notes
                  </p>
                  <p className="text-foreground/80 leading-relaxed">{record.notes}</p>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function Dashboard() {
  const { orgId } = useAuth();
  const { data: stats, isLoading } = useDashboardStats(orgId ?? undefined);
  const { data: outbound, isLoading: outboundLoading } = useOutboundCallResults();
  const [selectedCall, setSelectedCall] = useState<any>(null);

  const statCards = [
    { label: "Total Calls", value: stats?.totalCalls ?? 0, icon: Phone, change: stats?.callsChange ?? "+0%" },
    { label: "Qualified Leads", value: stats?.qualifiedLeads ?? 0, icon: Users, change: stats?.leadsChange ?? "+0%" },
    { label: "Appointments", value: stats?.appointments ?? 0, icon: CalendarDays, change: stats?.appointmentsChange ?? "+0%" },
    { label: "Revenue Pipeline", value: formatCurrency(stats?.potentialRevenue ?? 0), icon: DollarSign, change: stats?.leadsChange ?? "+0%" },
  ];

  const outboundStatCards = [
    {
      label: "Total Outbound",
      value: outbound?.stats.totalCalled ?? 0,
      icon: PhoneOutgoing,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Answered",
      value: outbound?.stats.answered ?? 0,
      icon: PhoneCall,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Interested",
      value: outbound?.stats.interested ?? 0,
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      label: "Pending Follow-up",
      value: outbound?.stats.pendingFollowUp ?? 0,
      icon: TrendingUp,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Your AI voice agents at a glance.</p>
      </div>

      {/* Inbound summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.change} from last week</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Clock className="h-5 w-5 text-primary" />This Week's Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Hours Saved</p><p className="font-display text-2xl font-bold">{stats?.hoursSaved ?? 0}h</p></div>
              <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Leads Filtered</p><p className="font-display text-2xl font-bold">{stats?.leadsFiltered ?? 0}</p></div>
              <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Appointments</p><p className="font-display text-2xl font-bold">{stats?.appointments ?? 0}</p></div>
              <div className="rounded-lg bg-secondary p-4"><p className="text-sm text-muted-foreground">Pipeline Value</p><p className="font-display text-2xl font-bold">{formatCurrency(stats?.potentialRevenue ?? 0)}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Phone className="h-5 w-5 text-primary" />Recent Inbound Calls</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : stats?.recentCalls?.length ? (
              <Table>
                <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Duration</TableHead><TableHead>Outcome</TableHead></TableRow></TableHeader>
                <TableBody>
                  {stats.recentCalls.map((call) => (
                    <TableRow key={call.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setSelectedCall(call)}>
                      <TableCell className="text-xs">{call.started_at ? new Date(call.started_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                      <TableCell>{formatDuration(call.duration_seconds)}</TableCell>
                      <TableCell>{scoreBadge(call.outcome)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No calls this week yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Outbound Activity ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PhoneOutgoing className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold tracking-tight">Outbound Activity</h2>
          <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Live · Airtable</span>
        </div>

        {/* Outbound summary mini-cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {outboundStatCards.map((s) => (
            <div key={s.label} className="rounded-lg border bg-card p-4 flex items-center gap-3 shadow-sm">
              <div className={cn("rounded-md p-2", s.bg)}>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
              <div>
                {outboundLoading ? (
                  <Skeleton className="h-6 w-10 mb-1" />
                ) : (
                  <p className="font-display text-2xl font-bold leading-none">{s.value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Outbound call log table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <span>Recent Outbound Calls</span>
              {outbound?.records?.length ? (
                <span className="text-xs font-normal text-muted-foreground">{outbound.records.length} record{outbound.records.length !== 1 ? "s" : ""} · click row to expand</span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {outboundLoading ? (
              <div className="space-y-2 px-6 pb-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-11 w-full" />)}
              </div>
            ) : outbound?.records?.length ? (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Next Action</TableHead>
                      <TableHead className="whitespace-nowrap">Last Called</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outbound.records.map((record) => (
                      <ExpandableRow key={record.id} record={record} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
                <div className="rounded-full bg-muted p-3">
                  <PhoneOutgoing className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">No outbound calls yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Once you launch outbound calls, results will appear here automatically.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary" />Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : stats?.recentLeads?.length ? (
            <Table>
              <TableHeader><TableRow><TableHead>Name / Phone</TableHead><TableHead>Score</TableHead><TableHead>Timeline</TableHead><TableHead>Budget</TableHead></TableRow></TableHeader>
              <TableBody>
                {stats.recentLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.name || lead.caller_phone || "Unknown"}</TableCell>
                    <TableCell>{scoreBadge(lead.score)}</TableCell>
                    <TableCell className="text-sm">{lead.timeline || "—"}</TableCell>
                    <TableCell className="text-sm">
                      {lead.budget_min || lead.budget_max
                        ? `${lead.budget_min ? formatCurrency(Number(lead.budget_min)) : "?"} – ${lead.budget_max ? formatCurrency(Number(lead.budget_max)) : "?"}`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No leads this week yet.</p>
          )}
        </CardContent>
      </Card>

      <CallTranscriptDialog call={selectedCall} open={!!selectedCall} onOpenChange={(open) => { if (!open) setSelectedCall(null); }} />
    </div>
  );
}
