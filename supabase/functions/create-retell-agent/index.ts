import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AgentConfig {
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

const VOICE_MAP: Record<string, string> = {
  friendly_professional: "11labs-Adrian",
  confident_expert: "11labs-Myra",
  warm_concierge: "11labs-Paola",
};

function buildConversationFlowNodes(config: AgentConfig) {
  const { company_name, agent_name } = config;

  const nodes: Record<string, unknown>[] = [
    {
      id: "greeting",
      type: "conversation",
      instruction: {
        type: "prompt",
        text: `You are Alex, the AI assistant for ${company_name}, working with ${agent_name}. Warmly greet the caller and ask how you can help them today. Keep it brief and professional. If they mention a specific listing or address, route to listing inquiry. If they express interest in buying, route to buyer interest. For anything else, try to understand their needs.`,
      },
      edges: [
        {
          id: "greeting_to_listing",
          transition_condition: { type: "prompt", prompt: "Caller is asking about a specific listing, property address, or wants listing information." },
          destination_node_id: "listing_inquiry",
        },
        {
          id: "greeting_to_interest",
          transition_condition: { type: "prompt", prompt: "Caller expresses interest in buying a home, looking for properties, or wants to work with an agent." },
          destination_node_id: "interest",
        },
      ],
    },
    {
      id: "listing_inquiry",
      type: "conversation",
      instruction: {
        type: "prompt",
        text: `The caller is asking about a specific listing. Acknowledge their interest and let them know ${agent_name} can provide detailed information. Transition to qualification questions so ${agent_name} can give them the best experience.`,
      },
      edges: [
        { id: "listing_to_interest", transition_condition: { type: "prompt", prompt: "Agent has acknowledged the listing inquiry and is ready to move to qualification." }, destination_node_id: "interest" },
      ],
    },
    {
      id: "interest",
      type: "conversation",
      instruction: { type: "prompt", text: `Ask the caller about their motivation for buying. What's driving their search? Listen carefully and be empathetic.` },
      extract_dynamic_variable: [{ name: "motivation_reason", description: "Why the caller is looking to buy", type: "string" }],
      edges: [{ id: "interest_to_timeline", transition_condition: { type: "prompt", prompt: "Caller has shared their motivation or reason for buying." }, destination_node_id: "timeline" }],
    },
    {
      id: "timeline",
      type: "conversation",
      instruction: { type: "prompt", text: `Ask about their buying timeline. "When are you hoping to make a move?"` },
      extract_dynamic_variable: [{ name: "timeline", description: "Buyer timeline", type: "string" }],
      edges: [{ id: "timeline_to_budget", transition_condition: { type: "prompt", prompt: "Caller has provided their timeline information." }, destination_node_id: "budget" }],
    },
    {
      id: "budget",
      type: "conversation",
      instruction: { type: "prompt", text: `Ask about their price range. Be conversational and non-judgmental.` },
      extract_dynamic_variable: [
        { name: "budget_min", description: "Minimum budget amount", type: "number" },
        { name: "budget_max", description: "Maximum budget amount", type: "number" },
      ],
      edges: [{ id: "budget_to_preapproval", transition_condition: { type: "prompt", prompt: "Caller has shared their budget range or declined to share." }, destination_node_id: "pre_approval" }],
    },
    {
      id: "pre_approval",
      type: "conversation",
      instruction: { type: "prompt", text: `Ask about their financing status. "Have you been pre-approved for a mortgage, or are you planning to pay cash?"` },
      extract_dynamic_variable: [
        { name: "financing_status", description: "Pre-approved, cash, not yet pre-approved", type: "string" },
        { name: "pre_approved", description: "Whether the caller is pre-approved", type: "boolean" },
      ],
      edges: [{ id: "preapproval_to_location", transition_condition: { type: "prompt", prompt: "Caller has answered about their financing status." }, destination_node_id: "location" }],
    },
    {
      id: "location",
      type: "conversation",
      instruction: { type: "prompt", text: `Ask about their preferred areas or neighborhoods.` },
      extract_dynamic_variable: [{ name: "preferred_locations", description: "List of preferred areas/neighborhoods", type: "string" }],
      edges: [{ id: "location_to_property", transition_condition: { type: "prompt", prompt: "Caller has shared their preferred locations." }, destination_node_id: "property_reqs" }],
    },
    {
      id: "property_reqs",
      type: "conversation",
      instruction: { type: "prompt", text: `Ask about their property requirements. Bedrooms, bathrooms, must-haves.` },
      extract_dynamic_variable: [
        { name: "bedrooms", description: "Number of bedrooms desired", type: "string" },
        { name: "bathrooms", description: "Number of bathrooms desired", type: "string" },
        { name: "must_haves", description: "Must-have features", type: "string" },
      ],
      edges: [{ id: "property_to_agent_status", transition_condition: { type: "prompt", prompt: "Caller has shared their property requirements." }, destination_node_id: "agent_status" }],
    },
    {
      id: "agent_status",
      type: "conversation",
      instruction: { type: "prompt", text: `Ask if they're currently working with another real estate agent.` },
      extract_dynamic_variable: [{ name: "has_agent", description: "Whether the caller already has an agent", type: "boolean" }],
      edges: [{ id: "agent_status_to_classify", transition_condition: { type: "prompt", prompt: "Caller has answered about working with another agent." }, destination_node_id: "lead_classify" }],
    },
    {
      id: "lead_classify",
      type: "conversation",
      instruction: { type: "prompt", text: `You have finished asking all qualification questions. Now you MUST immediately transition to the next step based on the caller's answers. Do NOT say goodbye, do NOT wrap up the call, do NOT tell the caller you will pass their info along. Simply say "Great, let me check what options we have for you" and then transition. Evaluate the caller based on: timeline, pre-approval/financing status, budget, and whether they have another agent.` },
      edges: [
        { id: "disqualified_lead", transition_condition: { type: "prompt", prompt: "The caller said they already have or are working with another real estate agent." }, destination_node_id: "graceful_exit" },
        { id: "hot_lead", transition_condition: { type: "prompt", prompt: "The caller's timeline is within 3 months AND they are pre-approved or paying cash AND they shared a budget AND they do NOT have another agent." }, destination_node_id: "schedule" },
        { id: "warm_lead", transition_condition: { type: "prompt", prompt: "The caller does not have another agent, but their timeline is 3-6 months OR they are missing pre-approval OR they did not share a budget." }, destination_node_id: "consultation" },
        { id: "default_nurture", transition_condition: { type: "prompt", prompt: "The caller does not have another agent and their timeline is beyond 6 months, or they are very early in their search." }, destination_node_id: "nurture" },
      ],
    },
    {
      id: "schedule",
      type: "conversation",
      instruction: { type: "prompt", text: `This is a hot lead! Enthusiastically offer to schedule a showing or meeting with ${agent_name}.` },
      extract_dynamic_variable: [
        { name: "preferred_day", description: "Preferred day for appointment", type: "string" },
        { name: "preferred_time", description: "Preferred time for appointment", type: "string" },
        { name: "appointment_requested", description: "Whether an appointment was requested", type: "boolean" },
      ],
      edges: [{ id: "schedule_to_contact", transition_condition: { type: "prompt", prompt: "Caller has provided scheduling preferences or declined." }, destination_node_id: "contact_capture" }],
    },
    {
      id: "contact_capture",
      type: "conversation",
      instruction: { type: "prompt", text: `Collect the caller's contact information: full name, phone number, and email address. Be friendly and explain you need this so ${agent_name} can follow up with them.` },
      extract_dynamic_variable: [
        { name: "caller_name", description: "Caller's full name", type: "string" },
        { name: "phone", description: "Caller's phone number", type: "string" },
        { name: "email", description: "Caller's email address", type: "string" },
      ],
      edges: [{ id: "contact_to_save", transition_condition: { type: "prompt", prompt: "Contact information has been collected." }, destination_node_id: "save_customer_info_node" }],
    },
    // Function node: automatically calls save_customer_info API when entered
    {
      id: "save_customer_info_node",
      type: "function",
      tool_id: "save_customer_info",
      tool_type: "local",
      wait_for_result: true,
      speak_during_execution: true,
      speak_during_execution_prompt: "Let me save your information in our system.",
      edges: [
        { id: "save_to_summary", transition_condition: { type: "prompt", prompt: "Function has completed execution." }, destination_node_id: "summary" },
      ],
    },
    {
      id: "consultation",
      type: "conversation",
      instruction: { type: "prompt", text: `This is a warm lead. Offer a consultation call with ${agent_name}. Collect their name, phone, and email so ${agent_name} can reach out.` },
      extract_dynamic_variable: [
        { name: "caller_name", description: "Caller's full name", type: "string" },
        { name: "phone", description: "Caller's phone number", type: "string" },
        { name: "email", description: "Caller's email address", type: "string" },
      ],
      edges: [{ id: "consultation_to_save", transition_condition: { type: "prompt", prompt: "Contact information has been collected or caller declined." }, destination_node_id: "save_customer_info_consultation" }],
    },
    // Function node for consultation path
    {
      id: "save_customer_info_consultation",
      type: "function",
      tool_id: "save_customer_info",
      tool_type: "local",
      wait_for_result: true,
      speak_during_execution: true,
      speak_during_execution_prompt: "Let me save your information.",
      edges: [
        { id: "save_consultation_to_summary", transition_condition: { type: "prompt", prompt: "Function has completed execution." }, destination_node_id: "summary" },
      ],
    },
    {
      id: "nurture",
      type: "conversation",
      instruction: { type: "prompt", text: `This caller is early in their journey. Be helpful. Offer to send market updates. Collect their name and email if they agree.` },
      extract_dynamic_variable: [
        { name: "caller_name", description: "Caller's full name", type: "string" },
        { name: "email", description: "Caller's email address", type: "string" },
      ],
      edges: [
        { id: "nurture_to_save", transition_condition: { type: "prompt", prompt: "Caller has provided contact info." }, destination_node_id: "save_customer_info_nurture" },
        { id: "nurture_to_summary", transition_condition: { type: "prompt", prompt: "Caller declined to provide info." }, destination_node_id: "summary" },
      ],
    },
    // Function node for nurture path
    {
      id: "save_customer_info_nurture",
      type: "function",
      tool_id: "save_customer_info",
      tool_type: "local",
      wait_for_result: true,
      speak_during_execution: true,
      speak_during_execution_prompt: "Saving your information so we can send you updates.",
      edges: [
        { id: "save_nurture_to_summary", transition_condition: { type: "prompt", prompt: "Function has completed execution." }, destination_node_id: "summary" },
      ],
    },
    {
      id: "graceful_exit",
      type: "conversation",
      instruction: { type: "prompt", text: `The caller already has an agent. Be respectful and professional. Wish them the best.` },
      edges: [{ id: "exit_to_summary", transition_condition: { type: "prompt", prompt: "The goodbye has been said." }, destination_node_id: "summary" }],
    },
    {
      id: "summary",
      type: "conversation",
      instruction: { type: "prompt", text: `Wrap up the call warmly. Thank them for calling ${company_name}.` },
      extract_dynamic_variable: [{ name: "lead_status", description: "HOT, WARM, COLD, or DISQUALIFIED", type: "string" }],
      edges: [],
    },
  ];

  return nodes;
}

// ─── Outbound conversation flow ───────────────────────────────────────────────
function buildOutboundFlowNodes(config: AgentConfig) {
  const { company_name, agent_name, outbound_goal, forwarding_number } = config;
  const goal = outbound_goal || "Follow up with leads and qualify their interest.";
  const transferNote = forwarding_number
    ? `If the lead is highly interested and ready to speak with an advisor now, you can transfer them by saying "Let me connect you with ${agent_name} right now." The transfer number is ${forwarding_number}.`
    : "";

  return [
    {
      id: "greeting",
      type: "conversation",
      instruction: {
        type: "prompt",
        text: `You are calling on behalf of ${company_name}. The lead's name is {{first_name}} {{last_name}}. Their original interest was: {{original_interest}}. Greet them warmly by first name, introduce yourself as an AI assistant for ${agent_name} at ${company_name}, and briefly explain why you're calling related to their interest. Ask if now is a good time to chat.`,
      },
      edges: [
        { id: "greeting_to_qualify", transition_condition: { type: "prompt", prompt: "The lead said yes or is willing to talk." }, destination_node_id: "qualify" },
        { id: "greeting_to_callback", transition_condition: { type: "prompt", prompt: "The lead said it's not a good time, they are busy, or asked to call back later." }, destination_node_id: "callback" },
        { id: "greeting_to_notinterested", transition_condition: { type: "prompt", prompt: "The lead said they are not interested or asked to be removed." }, destination_node_id: "not_interested" },
      ],
    },
    {
      id: "qualify",
      type: "conversation",
      instruction: {
        type: "prompt",
        text: `${goal} Ask open-ended questions to understand their current situation, level of interest, and urgency. Be conversational and genuinely helpful. Do not be pushy. ${transferNote}`,
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
      instruction: {
        type: "prompt",
        text: `The lead is busy right now. Politely ask when would be a better time to call back and thank them for their time. Keep it brief.`,
      },
      extract_dynamic_variable: [
        { name: "next_action", description: "callback", type: "string" },
        { name: "notes", description: "Preferred callback time if mentioned", type: "string" },
      ],
      edges: [
        { id: "callback_to_wrap", transition_condition: { type: "prompt", prompt: "Callback time discussed or call ending." }, destination_node_id: "wrap_up" },
      ],
    },
    {
      id: "not_interested",
      type: "conversation",
      instruction: {
        type: "prompt",
        text: `The lead is not interested. Be gracious, professional, and wish them well. Let them know they can reach out to ${company_name} in the future if their situation changes.`,
      },
      extract_dynamic_variable: [
        { name: "next_action", description: "no_action", type: "string" },
        { name: "interest_level", description: "low", type: "string" },
      ],
      edges: [
        { id: "notinterested_to_wrap", transition_condition: { type: "prompt", prompt: "Goodbye has been said." }, destination_node_id: "wrap_up" },
      ],
    },
    {
      id: "wrap_up",
      type: "conversation",
      instruction: {
        type: "prompt",
        text: `Wrap up the call naturally. Thank {{first_name}} for their time, briefly recap the next steps if any, and wish them a great day.`,
      },
      extract_dynamic_variable: [
        { name: "call_status", description: "answered, voicemail, no_answer, or not_interested", type: "string" },
      ],
      edges: [],
    },
  ];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const config: AgentConfig = await req.json();
    const { data: membership } = await supabase
      .from("org_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("org_id", config.org_id)
      .in("role", ["owner", "admin"])
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: "Not authorized for this organization" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RETELL_API_KEY = Deno.env.get("RETELL_API_KEY");
    if (!RETELL_API_KEY) {
      return new Response(JSON.stringify({ error: "Retell API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nodes = buildConversationFlowNodes(config);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const webhookUrl = `${supabaseUrl}/functions/v1/retell-webhook`;
    const saveCustomerInfoUrl = `${supabaseUrl}/functions/v1/save-customer-info`;


    const tools = [
      {
        type: "custom",
        tool_id: "save_customer_info",
        name: "save_customer_info",
        description: "Save collected customer information to the database. Call this function after collecting the caller's contact information. Always include the agent_id (use the dynamic variable {{retell_agent_id}}) and call_id (use the dynamic variable {{call_id}}).",
        url: saveCustomerInfoUrl,
        method: "POST",
        speak_during_execution: true,
        speak_after_execution: true,
        execution_message_description: "Saving your information to our system",
        parameters: {
          type: "object",
          properties: {
            agent_id: { type: "string", description: "The Retell agent ID. Use the value of the dynamic variable {{retell_agent_id}}" },
            call_id: { type: "string", description: "The current call ID. Use the value of the dynamic variable {{call_id}}" },
            caller_name: { type: "string", description: "Caller's full name" },
            phone: { type: "string", description: "Caller's phone number" },
            email: { type: "string", description: "Caller's email address" },
            timeline: { type: "string", description: "Buyer timeline (e.g. 0-3 months, 3-6 months)" },
            budget_min: { type: "number", description: "Minimum budget amount" },
            budget_max: { type: "number", description: "Maximum budget amount" },
            financing_status: { type: "string", description: "Financing status (pre-approved, cash, not yet)" },
            pre_approved: { type: "boolean", description: "Whether caller is pre-approved for mortgage" },
            preferred_locations: { type: "string", description: "Preferred areas or neighborhoods" },
            bedrooms: { type: "string", description: "Number of bedrooms desired" },
            bathrooms: { type: "string", description: "Number of bathrooms desired" },
            must_haves: { type: "string", description: "Must-have property features" },
            motivation_reason: { type: "string", description: "Why the caller is looking to buy" },
            has_agent: { type: "boolean", description: "Whether caller already has a real estate agent" },
          },
          required: ["caller_name"],
        },
      },
    ];

    const flowPayload = {
      name: `${config.company_name} - ${config.agent_name} Buyer Qualification`,
      nodes,
      tools,
      start_node_id: "greeting",
      start_speaker: "agent",
      model_choice: { type: "cascading", model: "gpt-4.1" },
      global_prompt: `You are Alex, a friendly and professional AI assistant for ${config.company_name}, helping ${config.agent_name}'s real estate business. You pre-qualify buyer leads. Be conversational, warm, and efficient. Never be pushy. Service areas: ${config.service_areas.join(", ")}.`,
      default_dynamic_variables: {
        retell_agent_id: "PLACEHOLDER_WILL_BE_UPDATED",
      },
    };

    console.log("Creating conversation flow in Retell...");
    const flowRes = await fetch("https://api.retellai.com/create-conversation-flow", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flowPayload),
    });

    if (!flowRes.ok) {
      const errBody = await flowRes.text();
      console.error("Retell flow creation failed:", errBody);
      return new Response(JSON.stringify({ error: "Failed to create conversation flow", details: errBody }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const flowData = await flowRes.json();
    const conversationFlowId = flowData.conversation_flow_id;

    const voiceId = VOICE_MAP[config.voice_persona] || "11labs-Adrian";
    const agentPayload = {
      agent_name: `${config.agent_name} - AI Assistant`,
      response_engine: { type: "conversation-flow", conversation_flow_id: conversationFlowId },
      voice_id: voiceId,
      webhook_url: webhookUrl,
      language: "en-US",
      enable_transcription: true,
    };

    console.log("Creating agent in Retell...");
    const agentRes = await fetch("https://api.retellai.com/create-agent", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(agentPayload),
    });

    if (!agentRes.ok) {
      const errBody = await agentRes.text();
      console.error("Retell agent creation failed:", errBody);
      return new Response(JSON.stringify({ error: "Failed to create agent", details: errBody }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const agentData = await agentRes.json();
    const retellAgentId = agentData.agent_id;

    // Update the conversation flow with the actual retell_agent_id as a dynamic variable
    console.log("Updating flow with retell_agent_id dynamic variable...");
    const updateFlowRes = await fetch(`https://api.retellai.com/update-conversation-flow/${conversationFlowId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        default_dynamic_variables: {
          retell_agent_id: retellAgentId,
        },
      }),
    });

    if (!updateFlowRes.ok) {
      const errBody = await updateFlowRes.text();
      console.error("Failed to update flow with agent_id:", errBody);
      // Non-fatal: continue even if this fails
    } else {
      console.log("Flow updated with retell_agent_id:", retellAgentId);
    }

    // Update flowPayload for DB storage with actual agent_id
    flowPayload.default_dynamic_variables = { retell_agent_id: retellAgentId };

    const { data: agent, error: insertError } = await supabase
      .from("agents")
      .insert({
        name: config.agent_name,
        org_id: config.org_id,
        status: "published",
        retell_agent_id: retellAgentId,
        retell_flow_id: conversationFlowId,
        company_name: config.company_name,
        service_areas: config.service_areas,
        voice_persona: config.voice_persona,
        calendly_link: config.calendly_link || null,
        auto_schedule: config.auto_schedule,
        phone_number: config.phone_number || null,
        forwarding_number: config.forwarding_number || null,
        published_workflow: flowPayload,
        last_published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("DB insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save agent", details: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("qualification_rules")
      .upsert({
        org_id: config.org_id,
        min_budget: config.min_budget,
        ready_timeline: config.timeline_threshold || "0-3",
        require_pre_approval: config.require_pre_approval,
      }, { onConflict: "org_id" });

    return new Response(JSON.stringify({
      success: true,
      agent,
      retell_agent_id: retellAgentId,
      retell_flow_id: conversationFlowId,
    }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
