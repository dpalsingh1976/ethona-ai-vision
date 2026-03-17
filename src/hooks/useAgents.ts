import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Agent {
  id: string;
  org_id: string;
  name: string;
  category: string;
  status: string;
  retell_agent_id: string | null;
  retell_flow_id: string | null;
  company_name: string | null;
  service_areas: string[] | null;
  calendly_link: string | null;
  auto_schedule: boolean;
  phone_number: string | null;
  forwarding_number: string | null;
  voice_persona: string | null;
  greeting_style: string | null;
  draft_workflow: Record<string, unknown>;
  published_workflow: Record<string, unknown> | null;
  version: number | null;
  last_published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAgents(orgId: string | undefined) {
  return useQuery({
    queryKey: ["agents", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Agent[];
    },
    enabled: !!orgId,
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase.from("agents").delete().eq("id", agentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useSyncAgentFlow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      agentDbId,
      retellAgentId,
      retellFlowId,
    }: {
      agentDbId: string;
      retellAgentId: string;
      retellFlowId: string | null;
    }) => {
      const { data, error } = await supabase.functions.invoke("sync-agent-flow", {
        body: {
          agent_db_id: agentDbId,
          retell_agent_id: retellAgentId,
          retell_flow_id: retellFlowId,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
