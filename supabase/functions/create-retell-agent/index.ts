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

// ─── Inbound conversation flow ────────────────────────────────────────────────
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
        { id: "greeting_to_listing", transition_condition: { type: "prompt", prompt: "Caller is asking about a specific listing, property address, or wants listing information." }, destination_node_id: "listing_inquiry" },
        { id: "greeting_to_interest", transition_condition: { type: "prompt", prompt: "Caller expresses interest in buying a home, looking for properties, or wants to work with an agent." }, destination_node_id: "interest" },
      ],
    },
    {
      id: "listing_inquiry",
      type: "conversation",
      instruction: { type: "prompt", text: `The caller is asking about a specific listing. Acknowledge their interest and let them know ${agent_name} can provide detailed information. Transition to qualification questions so ${agent_name} can give them the best experience.` },
      edges: [{ id: "listing_to_interest", transition_condition: { type: "prompt", prompt: "Agent has acknowledged the listing inquiry and is ready to move to qualification." }, destination_node_id: "interest" }],
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
      instruction: { type: "prompt", text: `You have finished asking all qualification questions. Now you MUST immediately transition to the next step based on the caller's answers. Do NOT say goodbye. Simply say "Great, let me check what options we have for you" and then transition.` },
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
    {
      id: "save_customer_info_node",
      type: "function",
      tool_id: "save_customer_info",
      tool_type: "local",
      wait_for_result: true,
      speak_during_execution: true,
      speak_during_execution_prompt: "Let me save your information in our system.",
      edges: [{ id: "save_to_summary", transition_condition: { type: "prompt", prompt: "Function has completed execution." }, destination_node_id: "summary" }],
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
    {
      id: "save_customer_info_consultation",
      type: "function",
      tool_id: "save_customer_info",
      tool_type: "local",
      wait_for_result: true,
      speak_during_execution: true,
      speak_during_execution_prompt: "Let me save your information.",
      edges: [{ id: "save_consultation_to_summary", transition_condition: { type: "prompt", prompt: "Function has completed execution." }, destination_node_id: "summary" }],
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
    {
      id: "save_customer_info_nurture",
      type: "function",
      tool_id: "save_customer_info",
      tool_type: "local",
      wait_for_result: true,
      speak_during_execution: true,
      speak_during_execution_prompt: "Saving your information so we can send you updates.",
      edges: [{ id: "save_nurture_to_summary", transition_condition: { type: "prompt", prompt: "Function has completed execution." }, destination_node_id: "summary" }],
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

// ─── Outbound conversation flow — Financial Services (Retirement & Life Insurance) ─
// Updated to support warm, consultative discovery for retirement planning and life insurance leads.
// KEY RULES:
//   - Never ask age directly; infer life stage through indirect conversational questions
//   - Ask one question at a time; use short acknowledgments ("Got it.", "That makes sense.")
//   - Extract structured post-call signals: product_interest, employment_stage, family_stage, etc.
//   - Two-stage Airtable writeback (core fields first, enhanced fields second) — see outbound-post-call
//
// INDIRECT AGE/LIFE-STAGE INFERENCE QUESTIONS (used in discovery node):
//   - "Are you still working full-time, or are you already retired?"  → employment_stage
//   - "Do you have kids still at home, in college, or are they grown?" → family_stage
//   - "Are you thinking more about protecting your family, or building future retirement income?" → product_interest
//   - "Have there been any big changes in your life recently — new job, new home, growing family — that have you thinking about your financial situation?" → urgency_level / trigger (outbound-safe)
//
// NEW AIRTABLE COLUMNS WRITTEN BY outbound-post-call (create these in Airtable if not present):
//   product_interest, primary_goal, family_stage, employment_stage, urgency_level,
//   objection_reason, callback_requested, appointment_ready, call_summary, extracted_need_signals
function buildOutboundFlowNodes(config: AgentConfig) {
  const { company_name, agent_name, forwarding_number } = config;
  const transferNote = forwarding_number
    ? ` If the lead is highly interested and ready to speak with ${agent_name} right now, offer to transfer them directly. Transfer number: ${forwarding_number}.`
    : "";

  return [
    // ── Node 1: Greeting ──────────────────────────────────────────────────────
    // Greet by first name, low-pressure opener, ask permission to continue.
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
    // Multi-topic financial discovery. Agent intelligently selects questions based on prior answers.
    // DO NOT ask all questions — pick 2-4 based on flow of conversation.
    // NEVER ask age directly. Infer life stage, needs, and urgency indirectly.
    {
      id: "discovery",
      type: "conversation",
      instruction: {
        type: "prompt",
        text: `CONTEXT: You are on an outbound call — YOU called {{first_name}}. Do not ask why they reached out or what brought them to you. You initiated this call on behalf of {{advisor_name}}.

You are in a warm, consultative discovery conversation with {{first_name}}. Your goal is to understand their financial situation, life stage, and likely needs — without asking their age directly.

OPENING THE DISCOVERY:
- If {{original_interest}} is non-empty, open with a tailored question based on that interest (e.g. if interest is retirement-related, start with "Are you still working full-time, or are you getting closer to retirement?").
- If {{original_interest}} is empty or unknown, open with this broad question: "What's more top of mind for you right now — making sure your family is protected, or planning ahead for retirement?" — then follow the answer to choose subsequent questions.

IMPORTANT RULES:
- Ask ONE question at a time
- Use short acknowledgments between questions: "Got it.", "That makes sense.", "Understood.", "That's helpful."
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
If conversation naturally concludes, transition to wrap_up.${transferNote}`,
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
    // Handle common objections gracefully. Acknowledge → reframe gently → one soft follow-up.
    // Handles: not interested, already has insurance, already has advisor, not thinking about it, suspicious.
    {
      id: "objection_handler",
      type: "conversation",
      instruction: {
        type: "prompt",
        text: `{{first_name}} has raised an objection. Handle it gracefully using this pattern:
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
    // Consultative next-step offer. No pressure. Offer a strategy conversation with the advisor.
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

Do NOT be aggressive. This should feel like a natural, helpful offer — not a sales close.${transferNote}`,
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
    // Lead is busy. Ask for preferred callback time. Keep it brief.
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
    // Lead is not interested from the start. Gracious exit — no follow-up pressure.
    {
      id: "not_interested",
      type: "conversation",
      instruction: {
        type: "prompt",
        text: `{{first_name}} is not interested. Be genuinely gracious and professional. Do NOT push back or try to reframe.

Say something like: "Absolutely, no problem at all. I appreciate you taking the call. If your situation ever changes or you'd like to explore options down the road, feel free to reach out to {{advisor_name}} at ${company_name}. Have a wonderful day."

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
    // Warm close. Recap next steps. Classify final call outcome.
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
        { name: "call_summary", description: "Concise 2-3 sentence summary of what happened, what was learned, and what the next step is", type: "string" },
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

    const isOutbound = config.category === "outbound";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const webhookUrl = isOutbound
      ? `${supabaseUrl}/functions/v1/outbound-post-call`
      : `${supabaseUrl}/functions/v1/retell-webhook`;
    const saveCustomerInfoUrl = `${supabaseUrl}/functions/v1/save-customer-info`;

    // ── Build flow payload ──────────────────────────────────────────────────
    let flowPayload: Record<string, unknown>;

    if (isOutbound) {
      flowPayload = {
        name: `${config.company_name} - ${config.agent_name} Outbound`,
        nodes: buildOutboundFlowNodes(config),
        tools: [],
        start_node_id: "greeting",
        start_speaker: "agent",
        model_choice: { type: "cascading", model: "gpt-4.1" },
        // Financial services global prompt — overrides agent-level defaults
        global_prompt: `You are a warm, professional AI assistant calling on behalf of {{advisor_name}} at ${config.company_name}. You help individuals and families explore retirement planning and life insurance options.

IMPORTANT: This is an OUTBOUND call. YOU are calling the lead — they did not reach out to you. Never use inbound-style language like "what prompted you to reach out", "what brought you to us", or "how can I help you today". You initiated this call on behalf of {{advisor_name}}.

CORE BEHAVIOR RULES:
- NEVER ask the lead's age directly — infer life stage from context clues (employment status, family situation, etc.)
- Ask ONE question at a time
- Use short natural acknowledgments: "Got it.", "That makes sense.", "Understood.", "That's helpful."
- Be genuinely curious and consultative — never robotic, scripted, or salesy
- If the lead says something, acknowledge it before moving to the next question
- Keep responses concise — 2-3 sentences maximum per turn
- Never be pushy or aggressive — this is a warm, helpful conversation

TONE: Friendly. Professional. Consultative. Human. Curious. Respectful.`,
        default_dynamic_variables: {
          first_name: "",
          last_name: "",
          original_interest: "",
          advisor_name: config.agent_name,
          transfer_number: config.forwarding_number || "",
          // Post-call extracted fields — populated by AI during call analysis
          interest_level: "",
          timeline: "",
          product_interest: "",
          employment_stage: "",
          family_stage: "",
          primary_goal: "",
          has_existing_coverage: "",
          working_with_advisor: "",
          urgency_level: "",
          objection_reason: "",
          appointment_ready: "",
          callback_requested: "",
          transfer_attempted: "",
          next_action: "",
          notes: "",
          extracted_need_signals: "",
          call_summary: "",
          call_status: "",
          retell_agent_id: "PLACEHOLDER_WILL_BE_UPDATED",
        },
      };
    } else {
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
      flowPayload = {
        name: `${config.company_name} - ${config.agent_name} Buyer Qualification`,
        nodes: buildConversationFlowNodes(config),
        tools,
        start_node_id: "greeting",
        start_speaker: "agent",
        model_choice: { type: "cascading", model: "gpt-4.1" },
        global_prompt: `You are Alex, a friendly and professional AI assistant for ${config.company_name}, helping ${config.agent_name}'s real estate business. You pre-qualify buyer leads. Be conversational, warm, and efficient. Never be pushy. Service areas: ${config.service_areas.join(", ")}.`,
        default_dynamic_variables: {
          retell_agent_id: "PLACEHOLDER_WILL_BE_UPDATED",
        },
      };
    }

    console.log(`Creating ${isOutbound ? "outbound" : "inbound"} conversation flow in Retell...`);
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
      agent_name: `${config.agent_name} - ${isOutbound ? "Outbound" : "AI Assistant"}`,
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

    console.log("Updating flow with retell_agent_id dynamic variable...");
    const currentVars = (flowPayload.default_dynamic_variables as Record<string, string>) || {};
    const updateFlowRes = await fetch(`https://api.retellai.com/update-conversation-flow/${conversationFlowId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        default_dynamic_variables: { ...currentVars, retell_agent_id: retellAgentId },
      }),
    });

    if (!updateFlowRes.ok) {
      const errBody = await updateFlowRes.text();
      console.error("Failed to update flow with agent_id:", errBody);
    } else {
      console.log("Flow updated with retell_agent_id:", retellAgentId);
    }

    (flowPayload.default_dynamic_variables as Record<string, string>).retell_agent_id = retellAgentId;

    const { data: agent, error: insertError } = await supabase
      .from("agents")
      .insert({
        name: config.agent_name,
        org_id: config.org_id,
        category: isOutbound ? "outbound" : "real_estate",
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

    if (!isOutbound) {
      await supabase
        .from("qualification_rules")
        .upsert({
          org_id: config.org_id,
          min_budget: config.min_budget,
          ready_timeline: config.timeline_threshold || "0-3",
          require_pre_approval: config.require_pre_approval,
        }, { onConflict: "org_id" });
    }

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
