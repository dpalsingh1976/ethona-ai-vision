import { useState } from "react";
import { Phone, Users, CalendarDays, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuthContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { CallTranscriptDialog } from "@/components/ai-agent/CallTranscriptDialog";

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

export default function Dashboard() {
  const { orgId } = useAuth();
  const { data: stats, isLoading } = useDashboardStats(orgId ?? undefined);
  const [selectedCall, setSelectedCall] = useState<any>(null);

  const statCards = [
    { label: "Total Calls", value: stats?.totalCalls ?? 0, icon: Phone, change: stats?.callsChange ?? "+0%" },
    { label: "Qualified Leads", value: stats?.qualifiedLeads ?? 0, icon: Users, change: stats?.leadsChange ?? "+0%" },
    { label: "Appointments", value: stats?.appointments ?? 0, icon: CalendarDays, change: stats?.appointmentsChange ?? "+0%" },
    { label: "Revenue Pipeline", value: formatCurrency(stats?.potentialRevenue ?? 0), icon: DollarSign, change: stats?.leadsChange ?? "+0%" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Your AI voice agents at a glance.</p>
      </div>

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
            <CardTitle className="flex items-center gap-2 text-lg"><Phone className="h-5 w-5 text-primary" />Recent Calls</CardTitle>
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
