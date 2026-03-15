import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OutboundCallRecord {
  id: string;
  retell_call_id: string;
  call_status: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number | null;
  transcript_summary: string;
  first_name: string;
  last_name: string;
  to_phone_number: string;
  interest_level: string;
  next_action: string;
  notes: string;
  timeline: string;
  original_interest: string;
  lead_source: string;
  has_existing_coverage: string;
  working_with_advisor: string;
  transfer_attempted: string;
}

export interface OutboundCallStats {
  totalCalled: number;
  answered: number;
  interested: number;
  pendingFollowUp: number;
}

export function useOutboundCallResults() {
  return useQuery({
    queryKey: ["outbound-call-results"],
    queryFn: async (): Promise<{ records: OutboundCallRecord[]; stats: OutboundCallStats }> => {
      const { data, error } = await supabase.functions.invoke("fetch-outbound-calls");

      if (error) throw error;

      const records: OutboundCallRecord[] = data?.records ?? [];

      const stats: OutboundCallStats = {
        totalCalled: records.length,
        answered: records.filter((r) => {
          const s = r.call_status?.toLowerCase() ?? "";
          return s.includes("connected") || s === "answered";
        }).length,
        // Only count as interested when the call was actually answered/connected
        interested: records.filter((r) => {
          const s = r.call_status?.toLowerCase() ?? "";
          const isReached = s.includes("connected") || s === "answered";
          return isReached && (r.interest_level === "high" || r.interest_level === "medium");
        }).length,
        pendingFollowUp: records.filter((r) => !!r.next_action).length,
      };

      return { records, stats };
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
