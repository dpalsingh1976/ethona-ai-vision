const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FLOW_ID = "conversation_flow_3ddcd04483f1";

const patchedNodes = [
  {
    id: "greeting",
    type: "conversation",
    instruction: {
      type: "prompt",
      text: `You are calling on behalf of the company. The lead's name is {{first_name}} {{last_name}}. Their original interest was: {{original_interest}}. Greet them warmly by first name, introduce yourself as an AI assistant, and briefly explain why you're calling. Ask if now is a good time to chat.`,
    },
    edges: [
      { id: "greeting_to_qualify", transition_condition: { type: "prompt", prompt: "The lead said yes or is willing to talk." }, destination_node_id: "qualify" },
      { id: "greeting_to_callback", transition_condition: { type: "prompt", prompt: "The lead said it's not a good time or asked to call back later." }, destination_node_id: "callback" },
      { id: "greeting_to_notinterested", transition_condition: { type: "prompt", prompt: "The lead said they are not interested or asked to be removed." }, destination_node_id: "not_interested" },
    ],
  },
  {
    id: "qualify",
    type: "conversation",
    instruction: {
      type: "prompt",
      text: `Ask open-ended questions to understand their current situation, level of interest, and urgency. Be conversational and genuinely helpful. Do not be pushy.`,
    },
    extract_dynamic_variable: [
      { name: "interest_level", description: "High, medium, or low interest", type: "string" },
      { name: "timeline", description: "How soon they want to act", type: "string" },
      { name: "transfer_attempted", description: "Whether a live transfer was attempted", type: "boolean" },
      { name: "next_action", description: "What the next step should be (callback, email, no_action)", type: "string" },
      { name: "notes", description: "Key points from the conversation", type: "string" },
    ],
    edges: [
      { id: "qualify_to_wrap", transition_condition: { type: "prompt", prompt: "The qualification conversation is complete or the lead wants to end the call." }, destination_node_id: "wrap_up" },
    ],
  },
  {
    id: "callback",
    type: "conversation",
    instruction: { type: "prompt", text: `The lead is busy right now. Politely ask when would be a better time to call back and thank them for their time.` },
    extract_dynamic_variable: [
      { name: "next_action", description: "callback", type: "string" },
      { name: "notes", description: "Preferred callback time if mentioned", type: "string" },
    ],
    edges: [{ id: "callback_to_wrap", transition_condition: { type: "prompt", prompt: "Callback time discussed or call ending." }, destination_node_id: "wrap_up" }],
  },
  {
    id: "not_interested",
    type: "conversation",
    instruction: { type: "prompt", text: `The lead is not interested. Be gracious, professional, and wish them well.` },
    extract_dynamic_variable: [
      { name: "next_action", description: "no_action", type: "string" },
      { name: "interest_level", description: "low", type: "string" },
    ],
    edges: [{ id: "notinterested_to_wrap", transition_condition: { type: "prompt", prompt: "Goodbye has been said." }, destination_node_id: "wrap_up" }],
  },
  {
    id: "wrap_up",
    type: "conversation",
    instruction: { type: "prompt", text: `Wrap up the call naturally. Thank {{first_name}} for their time, briefly recap the next steps if any, and wish them a great day.` },
    extract_dynamic_variable: [
      { name: "call_status", description: "answered, voicemail, no_answer, or not_interested", type: "string" },
    ],
    edges: [{ id: "wrap_to_end", transition_condition: { type: "prompt", prompt: "The goodbye and wrap-up message has been delivered." }, destination_node_id: "end_call" }],
  },
  {
    id: "end_call",
    type: "end",
    speak_during_execution: true,
    speak_during_execution_prompt: "Thank {{first_name}} for their time and say a warm goodbye.",
    instruction: { type: "prompt", text: "Say a warm goodbye and end the call." },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const retellApiKey = Deno.env.get("RETELL_API_KEY");
  if (!retellApiKey) {
    return new Response(JSON.stringify({ error: "Missing RETELL_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const patchRes = await fetch(`https://api.retellai.com/update-conversation-flow/${FLOW_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${retellApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nodes: patchedNodes }),
    });

    const result = await patchRes.json();

    if (!patchRes.ok) {
      return new Response(JSON.stringify({ error: "Retell API error", details: result }), {
        status: patchRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, flow_id: FLOW_ID, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
