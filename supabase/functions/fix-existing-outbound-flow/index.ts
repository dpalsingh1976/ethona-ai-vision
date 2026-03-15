// Patches the live Retell conversation flow (conversation_flow_3ddcd04483f1)
// with the updated financial services node structure for retirement planning
// and life insurance outbound calling.
//
// HOW TO USE: POST to this edge function (no body required) to push the latest
// node definitions to the live agent. Safe to run multiple times (idempotent nodes).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FLOW_ID = "conversation_flow_3ddcd04483f1";

// ── Global prompt for the financial services outbound agent ───────────────────
const GLOBAL_PROMPT = `You are a warm, professional AI assistant calling on behalf of {{advisor_name}}. You help individuals and families explore retirement planning and life insurance options.

CORE BEHAVIOR RULES:
- NEVER ask the lead's age directly — infer life stage from context (employment status, family situation, retirement horizon, etc.)
- Ask ONE question at a time
- Use short natural acknowledgments between questions: "Got it.", "That makes sense.", "Understood.", "That's helpful."
- Be genuinely curious and consultative — never robotic, scripted, or salesy
- If the lead shares something, acknowledge it before moving forward
- Keep responses concise — 2-3 sentences per turn maximum
- Never be pushy or aggressive — this is a warm, helpful conversation

TONE: Friendly. Professional. Consultative. Human. Curious. Respectful.`;

// ── Updated financial services conversation nodes ─────────────────────────────
// Flow structure:
//   greeting → discovery → appointment_pitch → wrap_up → end_call
//                        ↘ objection_handler ↗
//            ↘ callback → wrap_up
//            ↘ not_interested → wrap_up
const patchedNodes = [
  // ── Node 1: Greeting ──────────────────────────────────────────────────────
  {
    id: "greeting",
    type: "conversation",
    instruction: {
      type: "prompt",
      text: `You are calling on behalf of {{advisor_name}}. The lead's name is {{first_name}} {{last_name}}.

Greet {{first_name}} warmly by first name. Introduce yourself as an AI assistant calling on behalf of {{advisor_name}}. Keep the reason for the call soft and low-pressure.

If {{original_interest}} is available and non-empty, use it as light context to personalize the reason for the call — e.g. "I understand you may have been looking into [topic] — we wanted to follow up on that." Do NOT read the value verbatim; weave it in naturally as part of the introduction.
If {{original_interest}} is empty or unknown, simply give a warm general opener about helping individuals and families explore retirement planning and life insurance options — do NOT reference their original interest at all.

Ask: "Did I catch you at an okay time for a quick minute?"

Keep the greeting brief, warm, and human. Do not ask any discovery questions here. Do not launch into a pitch.`,
    },
    edges: [
      {
        id: "greeting_to_discovery",
        transition_condition: { type: "prompt", prompt: "The lead said yes, seems receptive, or is willing to talk briefly." },
        destination_node_id: "discovery",
      },
      {
        id: "greeting_to_callback",
        transition_condition: { type: "prompt", prompt: "The lead said it's not a good time, they're busy, or asked to be called back later." },
        destination_node_id: "callback",
      },
      {
        id: "greeting_to_notinterested",
        transition_condition: { type: "prompt", prompt: "The lead clearly said they are not interested, want to be removed, or said do not call." },
        destination_node_id: "not_interested",
      },
    ],
  },

  // ── Node 2: Discovery ─────────────────────────────────────────────────────
  // Warm, consultative financial discovery. Agent chooses 2-4 questions max.
  // Never asks age directly. Infers life stage, needs, urgency indirectly.
  {
    id: "discovery",
    type: "conversation",
    instruction: {
      type: "prompt",
      text: `You are in a warm, consultative discovery conversation with {{first_name}}. Your goal is to understand their financial situation, life stage, and likely needs — without asking their age directly.

OPENING THE DISCOVERY:
- If {{original_interest}} is non-empty, open with a tailored question based on that interest (e.g. if interest is retirement-related, start with "Are you still working full-time, or are you getting closer to retirement?").
- If {{original_interest}} is empty or unknown, open with this broad question: "What's more top of mind for you right now — making sure your family is protected, or planning ahead for retirement?" — then follow the answer to choose subsequent questions.

IMPORTANT RULES:
- Ask ONE question at a time
- Use short acknowledgments: "Got it.", "That makes sense.", "Understood.", "That's helpful."
- Do NOT ask all questions — choose 2 to 4 based on the conversation flow
- If they share information voluntarily, acknowledge it and move naturally
- Be genuinely curious, not interrogating

INDIRECT DISCOVERY QUESTIONS — choose based on conversation:
1. "Are you still working full-time, or are you already retired?" → infers employment stage
2. "Are you thinking more about protecting your family right now, or building future retirement income?" → infers product focus
3. "Do you have kids still at home, in college, or are they grown?" → infers family stage / dependents
4. "Do you already have some life insurance in place, or is that something you've been meaning to look into?" → infers coverage status
5. "Have you done any real planning yet for long-term retirement income?" → infers retirement readiness
6. "A lot of people worry about outliving their savings or leaving their family underprotected — which side feels more relevant to you?" → infers primary concern
7. "Are you mostly looking for peace of mind, better long-term growth, or both?" → infers goal
8. "Have you reviewed your current protection or retirement strategy in the last year or so?" → infers recency / urgency
9. "Is there a specific reason this topic has been on your mind lately?" → infers trigger / urgency

WHAT TO LISTEN FOR and CAPTURE:
- Employment status: working full-time, pre-retirement, semi-retired, fully retired
- Family situation: young kids, teens, college-age, grown children, spouse/partner, single
- Primary need: retirement income, family protection, tax-efficient planning, legacy planning, mortgage/debt protection
- Existing coverage: has life insurance, no insurance, has 401k/IRA, not sure
- Existing advisor: works with someone, open to review, no advisor
- Urgency signals: recent life event, upcoming retirement, new child, new home, business change

If an objection arises mid-discovery, transition to objection_handler.
If interest is detected, transition to appointment_pitch.
If conversation naturally concludes, transition to wrap_up.`,
    },
    extract_dynamic_variable: [
      { name: "interest_level", description: "high, medium, or low based on engagement and signals", type: "string" },
      { name: "timeline", description: "How soon they want to take action (e.g. immediately, 3-6 months, next year, not sure)", type: "string" },
      { name: "product_interest", description: "One of: Retirement Planning, Life Insurance, Both, Not Determined", type: "string" },
      { name: "employment_stage", description: "e.g. working full-time, pre-retirement, semi-retired, retired", type: "string" },
      { name: "family_stage", description: "e.g. young kids at home, teenagers, grown children, no dependents, spouse/partner", type: "string" },
      { name: "primary_goal", description: "e.g. family protection, retirement income, tax-efficient planning, legacy planning, peace of mind", type: "string" },
      { name: "has_existing_coverage", description: "Whether the lead has existing life insurance or retirement plan in place", type: "boolean" },
      { name: "working_with_advisor", description: "Whether the lead is currently working with a financial advisor", type: "boolean" },
      { name: "urgency_level", description: "high, medium, or low based on timeline signals and trigger events", type: "string" },
      { name: "objection_reason", description: "Any objection raised, e.g. already has advisor, not thinking about it, already has insurance", type: "string" },
      { name: "appointment_ready", description: "Whether the lead expressed willingness to schedule a consultation or strategy call", type: "boolean" },
      { name: "callback_requested", description: "Whether the lead asked to be called back at a different time", type: "boolean" },
      { name: "transfer_attempted", description: "Whether a live transfer to an advisor was attempted during the call", type: "boolean" },
      { name: "next_action", description: "Recommended next step: appointment, callback, email, no_action", type: "string" },
      { name: "notes", description: "Key points, signals, and context from the conversation", type: "string" },
      { name: "extracted_need_signals", description: "Comma-separated list of detected need signals, e.g. has dependents, nearing retirement, no life insurance, wants guaranteed income", type: "string" },
      { name: "call_summary", description: "Concise 2-3 sentence human-readable summary of what was discussed and what the lead needs", type: "string" },
    ],
    edges: [
      {
        id: "discovery_to_pitch",
        transition_condition: { type: "prompt", prompt: "The lead has shown interest, engaged with the questions, and seems open to learning more or scheduling a call." },
        destination_node_id: "appointment_pitch",
      },
      {
        id: "discovery_to_objection",
        transition_condition: { type: "prompt", prompt: "The lead raised a clear objection — said they're not interested, already have insurance, already have an advisor, or pushed back." },
        destination_node_id: "objection_handler",
      },
      {
        id: "discovery_to_wrap",
        transition_condition: { type: "prompt", prompt: "The conversation has naturally concluded, the lead wants to end the call, or all useful discovery is complete." },
        destination_node_id: "wrap_up",
      },
    ],
  },

  // ── Node 3: Objection Handler ─────────────────────────────────────────────
  {
    id: "objection_handler",
    type: "conversation",
    instruction: {
      type: "prompt",
      text: `{{first_name}} has raised an objection. Handle it gracefully:
1. ACKNOWLEDGE — validate what they said, do NOT argue
2. REFRAME GENTLY — offer one soft perspective
3. ONE FOLLOW-UP — ask a single soft question to see if there's an opening
4. If still resistant — respect it completely and transition to wrap_up

EXAMPLE RESPONSES BY OBJECTION TYPE:

"Not interested":
"Totally understand — I appreciate you being upfront. A lot of people feel the same way until they realize there may be gaps they hadn't considered. Would it be okay if I just asked one quick question before we part ways?"

"Already have insurance / advisor":
"That's great — sounds like you've been proactive about it. We often help people just review what they have to make sure it still fits where they are today. Would a quick second opinion be worthwhile at some point?"

"Not thinking about retirement yet":
"That makes sense — most people don't start until something prompts them. Usually the earlier folks look at it, the more options they have. Is there anything about your current setup that's been on your mind, even a little?"

"Too busy / bad time":
"No problem at all — I completely respect that. Would it be better if someone reached out at another time, or would you prefer I just share a quick note with {{advisor_name}} and let them follow up?"

"Suspicious of the call":
"Completely fair — there are a lot of calls out there that aren't worth your time. I'm just reaching out on behalf of {{advisor_name}} who works with folks in your area on retirement and insurance planning. No pressure at all — happy to end the call if you'd prefer."

Keep responses concise. ONE reframe, ONE follow-up maximum. If still resistant, exit gracefully.`,
    },
    extract_dynamic_variable: [
      { name: "objection_reason", description: "The specific objection raised", type: "string" },
      { name: "interest_level", description: "Updated interest assessment after objection handling", type: "string" },
      { name: "callback_requested", description: "Whether they asked for a callback", type: "boolean" },
    ],
    edges: [
      {
        id: "objection_to_pitch",
        transition_condition: { type: "prompt", prompt: "The lead's resistance has softened and they seem open to hearing more or scheduling a call." },
        destination_node_id: "appointment_pitch",
      },
      {
        id: "objection_to_wrap",
        transition_condition: { type: "prompt", prompt: "The lead remains not interested, the objection was not resolved, or they want to end the conversation." },
        destination_node_id: "wrap_up",
      },
    ],
  },

  // ── Node 4: Appointment Pitch ─────────────────────────────────────────────
  {
    id: "appointment_pitch",
    type: "conversation",
    instruction: {
      type: "prompt",
      text: `Based on what {{first_name}} has shared, offer a consultative next step — a short strategy conversation with {{advisor_name}}. Keep it low-pressure, helpful, and concise.

EXAMPLE LANGUAGE:
"Based on what you've shared, it sounds like it could make real sense to have a quick strategy conversation with {{advisor_name}}. It's just a short call — no commitment — to review options that may fit your situation. Would you be open to that?"

If they say yes: confirm their interest, thank them, and note that {{advisor_name}} will follow up.
If they prefer a callback instead: acknowledge and capture the preferred time.
If they decline: respect it, wish them well, and transition to wrap_up.

Do NOT be aggressive. This should feel like a natural, helpful offer — not a sales close.`,
    },
    extract_dynamic_variable: [
      { name: "appointment_ready", description: "Whether the lead agreed to a consultation or strategy call", type: "boolean" },
      { name: "callback_requested", description: "Whether they preferred a callback over scheduling now", type: "boolean" },
      { name: "next_action", description: "appointment, callback, or no_action", type: "string" },
      { name: "notes", description: "Any preferences or context for the follow-up", type: "string" },
    ],
    edges: [
      {
        id: "pitch_to_wrap",
        transition_condition: { type: "prompt", prompt: "The appointment offer has been made and the lead responded — accepted, preferred a callback, or declined." },
        destination_node_id: "wrap_up",
      },
    ],
  },

  // ── Node 5: Callback ──────────────────────────────────────────────────────
  {
    id: "callback",
    type: "conversation",
    instruction: {
      type: "prompt",
      text: `{{first_name}} is not available right now. Be warm and understanding. Ask: "No problem at all — when would be a better time for someone to reach out?"

Capture their preferred time or day if they share it. Thank them for their time and let them know {{advisor_name}}'s team will be in touch.`,
    },
    extract_dynamic_variable: [
      { name: "callback_requested", description: "true — lead requested a callback", type: "boolean" },
      { name: "next_action", description: "callback", type: "string" },
      { name: "notes", description: "Preferred callback time or day if provided", type: "string" },
    ],
    edges: [
      {
        id: "callback_to_wrap",
        transition_condition: { type: "prompt", prompt: "Callback time has been discussed or the lead is ending the call." },
        destination_node_id: "wrap_up",
      },
    ],
  },

  // ── Node 6: Not Interested ────────────────────────────────────────────────
  {
    id: "not_interested",
    type: "conversation",
    instruction: {
      type: "prompt",
      text: `{{first_name}} is not interested. Be genuinely gracious and professional. Do NOT push back or try to reframe.

Say something like: "Absolutely, no problem at all. I appreciate you taking the call. If your situation ever changes or you'd like to explore options down the road, feel free to reach out to {{advisor_name}}. Have a wonderful day."

Keep it brief and warm.`,
    },
    extract_dynamic_variable: [
      { name: "interest_level", description: "low", type: "string" },
      { name: "next_action", description: "no_action", type: "string" },
      { name: "call_status", description: "Connected - Not Interested", type: "string" },
    ],
    edges: [
      {
        id: "notinterested_to_wrap",
        transition_condition: { type: "prompt", prompt: "The goodbye has been said." },
        destination_node_id: "wrap_up",
      },
    ],
  },

  // ── Node 7: Wrap Up ───────────────────────────────────────────────────────
  {
    id: "wrap_up",
    type: "conversation",
    instruction: {
      type: "prompt",
      text: `Wrap up the call naturally and warmly. Thank {{first_name}} for their time. Briefly recap the next step if there is one (e.g. "{{advisor_name}} will follow up with you", or "We'll give you a call back at a better time"). Wish them a great day.

Keep the wrap-up concise — 2-3 sentences maximum.`,
    },
    extract_dynamic_variable: [
      {
        name: "call_status",
        description: "Final call outcome — must be one of: Connected - Interested, Connected - Retirement Planning, Connected - Life Insurance, Connected - Both, Connected - Callback Requested, Connected - Not Interested, Voicemail Left, No Answer, Wrong Number, Do Not Contact",
        type: "string",
      },
      {
        name: "call_summary",
        description: "Concise 2-3 sentence summary of what happened, what was learned, and what the next step is",
        type: "string",
      },
    ],
    edges: [
      {
        id: "wrap_to_end",
        transition_condition: { type: "prompt", prompt: "The goodbye and wrap-up message has been delivered." },
        destination_node_id: "end_call",
      },
    ],
  },

  // ── Node 8: End Call ──────────────────────────────────────────────────────
  {
    id: "end_call",
    type: "end",
    speak_during_execution: true,
    speak_during_execution_prompt: "Say a warm, genuine goodbye to {{first_name}} and end the call.",
    instruction: { type: "prompt", text: "Say a warm goodbye and end the call." },
  },
];

// ── Updated default dynamic variables ────────────────────────────────────────
// All fields the flow reads from Airtable or extracts during the call
const DEFAULT_DYNAMIC_VARIABLES: Record<string, string> = {
  // Pre-call (read from Airtable)
  first_name: "",
  last_name: "",
  original_interest: "",
  advisor_name: "",
  transfer_number: "",
  // Post-call core (written back to Airtable — existing columns)
  interest_level: "",
  timeline: "",
  has_existing_coverage: "",
  working_with_advisor: "",
  transfer_attempted: "",
  next_action: "",
  notes: "",
  call_status: "",
  // Post-call enhanced (written back to Airtable — new columns)
  product_interest: "",
  primary_goal: "",
  family_stage: "",
  employment_stage: "",
  urgency_level: "",
  objection_reason: "",
  callback_requested: "",
  appointment_ready: "",
  call_summary: "",
  extracted_need_signals: "",
};

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
      body: JSON.stringify({
        nodes: patchedNodes,
        global_prompt: GLOBAL_PROMPT,
        default_dynamic_variables: DEFAULT_DYNAMIC_VARIABLES,
      }),
    });

    const result = await patchRes.json();

    if (!patchRes.ok) {
      return new Response(JSON.stringify({ error: "Retell API error", details: result }), {
        status: patchRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        flow_id: FLOW_ID,
        nodes_updated: patchedNodes.length,
        result,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
