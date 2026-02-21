import { Phone, Users, Target, CalendarDays, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function formatDuration(seconds: number) {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function Analytics() {
  const { orgId } = useAuth();
  const { data: stats, isLoading, refetch } = useAnalytics(orgId ?? undefined);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-retell-calls");
      if (error) throw error;
      toast.success(`Synced ${data?.synced ?? 0} new calls from Retell`);
      refetch();
    } catch (err: any) {
      toast.error("Failed to sync: " + (err.message || "Unknown error"));
    } finally {
      setSyncing(false);
    }
  };

  const statCards = [
    { label: "Total Calls", value: stats?.totalCalls ?? 0, icon: Phone },
    { label: "Avg Duration", value: formatDuration(stats?.avgDuration ?? 0), icon: Clock },
    { label: "Qualification Rate", value: `${stats?.qualificationRate ?? 0}%`, icon: Target },
    { label: "Appointment Rate", value: `${stats?.appointmentRate ?? 0}%`, icon: CalendarDays },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted-foreground">Last 30 days of call funnel, agent performance, and ROI.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
          Sync from Retell
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>{isLoading ? <Skeleton className="h-8 w-20" /> : <p className="font-display text-2xl font-bold">{stat.value}</p>}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Phone className="h-5 w-5 text-primary" />Call Volume (30 days)</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats?.callVolumeData ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" className="fill-muted-foreground" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--card-foreground))" }} />
                  <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary" />Lead Funnel</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats?.funnelData ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} width={90} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--card-foreground))" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {(stats?.funnelData ?? []).map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {stats?.agentPerf && stats.agentPerf.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Agent Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.agentPerf.map((agent) => (
                <div key={agent.name} className="rounded-lg bg-secondary p-4 space-y-2">
                  <p className="font-display font-semibold">{agent.name}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-xs text-muted-foreground">Calls</p><p className="font-display text-lg font-bold">{agent.totalCalls}</p></div>
                    <div><p className="text-xs text-muted-foreground">Avg Duration</p><p className="font-display text-lg font-bold">{formatDuration(agent.avgDuration)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Qual. Rate</p><p className="font-display text-lg font-bold">{agent.qualificationRate}%</p></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
