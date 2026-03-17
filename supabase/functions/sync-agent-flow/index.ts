import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agent_db_id, retell_agent_id, retell_flow_id } = await req.json();

    if (!retell_agent_id) {
      return new Response(JSON.stringify({ error: 'retell_agent_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const RETELL_API_KEY = Deno.env.get('RETELL_API_KEY');
    if (!RETELL_API_KEY) {
      return new Response(JSON.stringify({ error: 'RETELL_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch agent info from Retell
    const agentRes = await fetch(`https://api.retellai.com/get-agent/${retell_agent_id}`, {
      headers: { 'Authorization': `Bearer ${RETELL_API_KEY}` }
    });

    if (!agentRes.ok) {
      const err = await agentRes.text();
      return new Response(JSON.stringify({ error: `Retell agent fetch failed: ${err}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const agentData = await agentRes.json();

    // Determine flow_id: use provided, or extract from agent data
    const flowId = retell_flow_id || agentData.response_engine?.llm_id || agentData.llm_id;

    let flowData = null;
    if (flowId) {
      const flowRes = await fetch(`https://api.retellai.com/get-retell-llm/${flowId}`, {
        headers: { 'Authorization': `Bearer ${RETELL_API_KEY}` }
      });
      if (flowRes.ok) {
        flowData = await flowRes.json();
      } else {
        // Try conversation flow endpoint
        const flowRes2 = await fetch(`https://api.retellai.com/get-conversation-flow/${flowId}`, {
          headers: { 'Authorization': `Bearer ${RETELL_API_KEY}` }
        });
        if (flowRes2.ok) {
          flowData = await flowRes2.json();
        }
      }
    }

    const workflow = {
      agent: agentData,
      flow: flowData,
      synced_at: new Date().toISOString(),
    };

    // Update in DB
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const col = agent_db_id ? 'id' : 'retell_agent_id';
    const val = agent_db_id || retell_agent_id;

    const { error: dbError } = await supabase
      .from('agents')
      .update({
        published_workflow: workflow,
        updated_at: new Date().toISOString(),
        status: 'published',
        last_published_at: new Date().toISOString(),
      })
      .eq(col, val);

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, workflow }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
