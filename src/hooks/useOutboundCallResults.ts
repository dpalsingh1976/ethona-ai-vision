import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OutboundCallRecord {
  id: string;
  first_name: string;
  last_name: string;
  to_phone_number: string;
  call_status: string;
  last_called: string;
  interest_level: string;
  timeline: string;
  next_action: string;
  notes: string;
  lead_source: string;
  original_interest: string;
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
      const { data, error } = await supabase.functions.invoke("fetch-outbound-call-results");

      if (error) throw error;

      const records: OutboundCallRecord[] = data?.records ?? [];

      const stats: OutboundCallStats = {
        totalCalled: records.length,
        answered: records.filter((r) => r.call_status === "answered").length,
        interested: records.filter(
          (r) => r.interest_level === "high" || r.interest_level === "medium"
        ).length,
        pendingFollowUp: records.filter((r) => !!r.next_action).length,
      };

      return { records: records.slice(0, 20), stats };
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
