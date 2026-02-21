import { Inbox, Phone, Mail, DollarSign, Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const SCORE_STYLES: Record<string, string> = {
  HOT: "bg-destructive/10 text-destructive border-destructive/20",
  WARM: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  COLD: "bg-primary/10 text-primary border-primary/20",
  DISQUALIFIED: "bg-muted text-muted-foreground border-muted",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  qualified: "Qualified",
  warm: "Warm",
  nurture: "Nurture",
  ready: "Ready",
  disqualified: "Disqualified",
  sent_to_agent: "Sent to Agent",
};

export default function Leads() {
  const { orgId } = useAuth();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, score, status, caller_phone, email, timeline, budget_min, budget_max, pre_approved, desired_areas, must_haves, motivation_reason, financing_status, created_at, notes")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (max) return `Up to ${fmt(max)}`;
    return `From ${fmt(min!)}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Leads</h1>
        <p className="mt-1 text-muted-foreground">Track and manage qualified buyer leads from your AI agents.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : !leads || leads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Inbox className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">No leads yet</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Leads will appear here once your agents start answering calls and qualifying buyers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold truncate">
                          {lead.name || "Unknown Caller"}
                        </h3>
                        {lead.score && (
                          <Badge className={SCORE_STYLES[lead.score] || ""}>
                            {lead.score}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {STATUS_LABELS[lead.status] || lead.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {lead.caller_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" /> {lead.caller_phone}
                          </span>
                        )}
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" /> {lead.email}
                          </span>
                        )}
                        {formatBudget(lead.budget_min, lead.budget_max) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" /> {formatBudget(lead.budget_min, lead.budget_max)}
                          </span>
                        )}
                        {lead.timeline && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {lead.timeline}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {lead.desired_areas && lead.desired_areas.length > 0 && (
                          <span>📍 {lead.desired_areas.join(", ")}</span>
                        )}
                        {lead.pre_approved && <span>✅ Pre-approved</span>}
                        {lead.financing_status && <span>💰 {lead.financing_status}</span>}
                        {lead.motivation_reason && <span>💡 {lead.motivation_reason}</span>}
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(lead.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
