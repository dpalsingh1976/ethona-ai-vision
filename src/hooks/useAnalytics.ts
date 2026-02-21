import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

export function useAnalytics(orgId: string | undefined) {
  return useQuery({
    queryKey: ["analytics", orgId],
    queryFn: async () => {
      if (!orgId) return null;

      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      const [callsRes, leadsRes, appointmentsRes, agentsRes] = await Promise.all([
        supabase.from("calls").select("id, duration_seconds, outcome, started_at, agent_id, created_at").eq("org_id", orgId).gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true }),
        supabase.from("leads").select("id, score, status, budget_max, created_at, agent_id").eq("org_id", orgId).gte("created_at", thirtyDaysAgo),
        supabase.from("appointments").select("id, status, created_at").eq("org_id", orgId).gte("created_at", thirtyDaysAgo),
        supabase.from("agents").select("id, name").eq("org_id", orgId),
      ]);

      const calls = callsRes.data || [];
      const leads = leadsRes.data || [];
      const appointments = appointmentsRes.data || [];
      const agents = agentsRes.data || [];

      const callsByDay: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        callsByDay[format(subDays(new Date(), i), "MMM dd")] = 0;
      }
      for (const c of calls) {
        const day = format(new Date(c.created_at), "MMM dd");
        if (day in callsByDay) callsByDay[day]++;
      }
      const callVolumeData = Object.entries(callsByDay).map(([date, count]) => ({ date, calls: count }));

      const funnel = { HOT: 0, WARM: 0, COLD: 0, DISQUALIFIED: 0 };
      for (const l of leads) {
        const score = l.score as keyof typeof funnel;
        if (score in funnel) funnel[score]++;
      }
      const funnelData = [
        { stage: "Hot", count: funnel.HOT, fill: "hsl(0 72% 51%)" },
        { stage: "Warm", count: funnel.WARM, fill: "hsl(38 92% 50%)" },
        { stage: "Cold", count: funnel.COLD, fill: "hsl(217 91% 60%)" },
        { stage: "Disqualified", count: funnel.DISQUALIFIED, fill: "hsl(220 10% 46%)" },
      ];

      const agentPerf = agents.map((agent) => {
        const agentCalls = calls.filter((c) => c.agent_id === agent.id);
        const agentLeads = leads.filter((l) => l.agent_id === agent.id);
        const qualified = agentLeads.filter((l) => l.score === "HOT" || l.score === "WARM").length;
        const avgDuration = agentCalls.length > 0
          ? Math.round(agentCalls.reduce((s, c) => s + (c.duration_seconds || 0), 0) / agentCalls.length)
          : 0;
        return {
          name: agent.name,
          totalCalls: agentCalls.length,
          avgDuration,
          qualificationRate: agentLeads.length > 0 ? Math.round((qualified / agentLeads.length) * 100) : 0,
        };
      });

      const totalCalls = calls.length;
      const avgDuration = totalCalls > 0 ? Math.round(calls.reduce((s, c) => s + (c.duration_seconds || 0), 0) / totalCalls) : 0;
      const qualifiedCount = leads.filter((l) => l.score === "HOT" || l.score === "WARM").length;
      const qualificationRate = leads.length > 0 ? Math.round((qualifiedCount / leads.length) * 100) : 0;
      const appointmentRate = leads.length > 0 ? Math.round((appointments.length / leads.length) * 100) : 0;

      return { callVolumeData, funnelData, agentPerf, totalCalls, avgDuration, qualificationRate, appointmentRate, totalLeads: leads.length, totalAppointments: appointments.length };
    },
    enabled: !!orgId,
    refetchInterval: 60000,
  });
}
