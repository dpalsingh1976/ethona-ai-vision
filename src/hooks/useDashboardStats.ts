import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardStats(orgId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard-stats", orgId],
    queryFn: async () => {
      if (!orgId) return null;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const [callsRes, leadsRes, appointmentsRes, prevCallsRes, prevLeadsRes] = await Promise.all([
        supabase.from("calls").select("id, duration_seconds, outcome, started_at, ended_at, transcript, transcript_summary, recording_url, retell_call_id, lead_id").eq("org_id", orgId).gte("created_at", weekAgo.toISOString()).order("created_at", { ascending: false }),
        supabase.from("leads").select("id, name, score, status, caller_phone, timeline, budget_min, budget_max, created_at").eq("org_id", orgId).gte("created_at", weekAgo.toISOString()).order("created_at", { ascending: false }),
        supabase.from("appointments").select("id, status, start_time").eq("org_id", orgId).gte("created_at", weekAgo.toISOString()),
        supabase.from("calls").select("id").eq("org_id", orgId).gte("created_at", twoWeeksAgo.toISOString()).lt("created_at", weekAgo.toISOString()),
        supabase.from("leads").select("id, score").eq("org_id", orgId).gte("created_at", twoWeeksAgo.toISOString()).lt("created_at", weekAgo.toISOString()),
      ]);

      const calls = callsRes.data || [];
      const leads = leadsRes.data || [];
      const appointments = appointmentsRes.data || [];
      const prevCalls = prevCallsRes.data || [];
      const prevLeads = prevLeadsRes.data || [];

      const qualifiedLeads = leads.filter((l) => l.score === "HOT" || l.score === "WARM");
      const prevQualified = prevLeads.filter((l) => l.score === "HOT" || l.score === "WARM");

      const totalDuration = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
      const hoursSaved = Math.round((totalDuration / 3600) * 10) / 10;

      function pctChange(current: number, previous: number) {
        if (previous === 0) return current > 0 ? "+100%" : "+0%";
        const pct = Math.round(((current - previous) / previous) * 100);
        return pct >= 0 ? `+${pct}%` : `${pct}%`;
      }

      return {
        totalCalls: calls.length,
        qualifiedLeads: qualifiedLeads.length,
        appointments: appointments.length,
        callsChange: pctChange(calls.length, prevCalls.length),
        leadsChange: pctChange(qualifiedLeads.length, prevQualified.length),
        appointmentsChange: pctChange(appointments.length, 0),
        hoursSaved,
        leadsFiltered: leads.length,
        potentialRevenue: leads.reduce((sum, l) => sum + (Number(l.budget_max) || 0), 0),
        recentCalls: calls.slice(0, 5),
        recentLeads: leads.slice(0, 5),
      };
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });
}
