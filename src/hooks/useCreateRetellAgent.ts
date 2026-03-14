import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CreateAgentPayload {
  agent_name: string;
  company_name: string;
  service_areas: string[];
  voice_persona: string;
  min_budget: number | null;
  timeline_threshold: string;
  require_pre_approval: boolean;
  auto_schedule: boolean;
  calendly_link: string;
  phone_number: string;
  forwarding_number: string;
  org_id: string;
  category?: "inbound" | "outbound";
  outbound_goal?: string;
}

export function useCreateRetellAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAgentPayload) => {
      const { data, error } = await supabase.functions.invoke("create-retell-agent", {
        body: payload,
      });

      if (error) {
        let message = error.message || "Edge function error";
        try {
          const context = (error as any).context;
          if (context && typeof context.json === "function") {
            const body = await context.json();
            if (body?.error) message = body.error;
            if (body?.details) message += `: ${typeof body.details === 'string' ? body.details : JSON.stringify(body.details)}`;
          }
        } catch {
          // ignore parsing errors
        }
        throw new Error(message);
      }
      if (data?.error) {
        const details = data.details ? `: ${typeof data.details === 'string' ? data.details : JSON.stringify(data.details)}` : '';
        throw new Error(data.error + details);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
