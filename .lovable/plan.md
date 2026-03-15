
## What we're updating

Two files need changes, plus `fix-existing-outbound-flow` will also be patched to push the new flow to the live agent `conversation_flow_3ddcd04483f1`.

---

## File 1: `supabase/functions/create-retell-agent/index.ts` — `buildOutboundFlowNodes()`

Replace the 6-node generic outbound flow with a rich financial services flow. Key structural changes:

**Global prompt** (on the flow payload):
> "You are a warm, professional AI calling on behalf of {{advisor_name}} at the company. You help individuals explore retirement planning and life insurance options. Never ask age directly. Be curious, consultative, and human. Ask one question at a time. Use short acknowledgments like 'Got it.', 'That makes sense.' Never be pushy or robotic."

**New node structure:**

```text
greeting
  ├──[receptive]──► discovery
  ├──[busy]────────► callback
  └──[not interested]► not_interested
        │
       discovery  (retirement/insurance/family/employment needs — indirect age profiling)
        │
       objection_handler  (branched if objection arises during discovery)
        │
       appointment_pitch  (if interest detected, offer a strategy call)
        │
       wrap_up
        │
       end_call
```

**Node details:**

`greeting`:
- Prompt: Greet {{first_name}} by name. Introduce as calling on behalf of {{advisor_name}}. Soft, low-pressure opener. Ask "Did I catch you at an okay time for a quick minute?"
- Edges: receptive → `discovery`, busy → `callback`, not_interested → `not_interested`

`discovery`:
- A rich multi-question discovery node. The agent intelligently chooses questions without asking all at once.
- Indirect life-stage inference via questions like: "Are you still working full-time, or are you already retired?", "Are you thinking more about protecting your family right now, or building future income for retirement?", "Do you have kids still at home, in college, or are they grown?"
- Detect: retirement vs protection focus, family situation, employment status, has existing coverage, existing advisor
- `extract_dynamic_variable` captures: `interest_level`, `timeline`, `product_interest` (retirement/life_insurance/both), `employment_stage`, `family_stage`, `primary_goal`, `has_existing_coverage`, `working_with_advisor`, `objection_reason`, `appointment_ready`, `callback_requested`, `extracted_need_signals`, `call_summary`
- Edges: interest_detected → `appointment_pitch`, objection → `objection_handler`, end → `wrap_up`

`objection_handler`:
- Handles: not interested, already has insurance, already has advisor, not thinking about retirement, call back later, suspicious caller
- Acknowledge → reframe gently → one soft follow-up → if still resistant exit
- Edges: recovers to `appointment_pitch` or exits to `wrap_up`

`appointment_pitch`:
- If lead is interested: "Based on what you shared, it sounds like a quick strategy conversation with {{advisor_name}} could be really helpful. Would you be open to a short call to review options that fit your situation?"
- No pressure, consultative tone
- `extract_dynamic_variable`: `appointment_ready`, `callback_requested`
- Edges → `wrap_up`

`callback`:
- Ask preferred callback time. Extract `notes` with time preference.
- `extract_dynamic_variable`: `next_action: "callback"`, `notes`
- Edge → `wrap_up`

`not_interested`:
- Gracious exit. Mention they can reach out if situation changes.
- `extract_dynamic_variable`: `interest_level: "low"`, `next_action: "no_action"`, `call_status: "Connected - Not Interested"`
- Edge → `wrap_up`

`wrap_up`:
- Thank {{first_name}}, briefly recap next steps if any, warm close.
- `extract_dynamic_variable`: `call_status` (full outcome labels: Connected - Interested, Connected - Retirement Planning, Connected - Life Insurance, Connected - Both, Connected - Callback Requested, Connected - Not Interested, Voicemail Left, No Answer, Wrong Number, Do Not Contact)
- Edge → `end_call`

`end_call` (type: "end"):
- Speak warm goodbye

---

## File 2: `supabase/functions/outbound-post-call/index.ts`

Expand the Airtable PATCH payload on `call_analyzed` to write all new fields extracted from the enhanced discovery flow.

**New fields mapped from `customData` (existing fields preserved, new ones added):**
```typescript
// Existing (preserved)
call_status, last_called, interest_level, timeline, has_existing_coverage,
working_with_advisor, transfer_attempted, next_action, notes

// New additions
product_interest        // "Retirement Planning" | "Life Insurance" | "Both"
primary_goal            // e.g. "tax-efficient retirement", "family protection"
family_stage            // e.g. "kids at home", "grown children", "no dependents"
employment_stage        // e.g. "working full-time", "pre-retirement", "retired"
urgency_level           // "high" | "medium" | "low"
objection_reason        // e.g. "already has advisor", "not thinking about it"
callback_requested      // boolean
appointment_ready       // boolean
call_summary            // concise human-readable summary
extracted_need_signals  // structured text of detected signals
```

The local Supabase `calls` table payload already captures `extracted_data: customData` so all these signals are also stored locally automatically — no DB migration needed.

---

## File 3: `supabase/functions/fix-existing-outbound-flow/index.ts`

Update the `patchedNodes` constant with the new full financial services node set (identical to what `buildOutboundFlowNodes` now produces), and also update the `global_prompt` in the PATCH body. This pushes the new flow to the live agent `conversation_flow_3ddcd04483f1` immediately.

Also update `default_dynamic_variables` to include the new field names so the Retell flow knows what to extract.

---

## New Airtable columns recommended

These do not exist yet in the current schema. The `outbound-post-call` code will write them if they exist — Airtable silently ignores unknown fields only if `typecast: true` is passed, but by default returns an error. To be safe, the code will use a **safe-write pattern**: only write a field if the value is non-null/non-empty, and existing known fields are written first in a separate PATCH call if needed.

Actually — the safest approach is to wrap the new fields in their own PATCH call so if any new field doesn't exist yet in Airtable it only fails the second call, not the first (which has the critical `call_status`, `last_called`). We'll split into two sequential PATCH calls:

1. **Core fields PATCH** (always): `call_status`, `last_called`, `interest_level`, `timeline`, `has_existing_coverage`, `working_with_advisor`, `transfer_attempted`, `next_action`, `notes`
2. **Enhanced fields PATCH** (best-effort, logs error but doesn't fail): `product_interest`, `primary_goal`, `family_stage`, `employment_stage`, `urgency_level`, `objection_reason`, `callback_requested`, `appointment_ready`, `call_summary`, `extracted_need_signals`

This guarantees existing Airtable behavior is never broken even if new columns haven't been created yet.

---

## Summary of files to edit

- `supabase/functions/create-retell-agent/index.ts` — replace `buildOutboundFlowNodes` with financial services version + update global_prompt
- `supabase/functions/outbound-post-call/index.ts` — expand Airtable writeback with new fields, split into core + enhanced PATCH calls
- `supabase/functions/fix-existing-outbound-flow/index.ts` — update patchedNodes + global_prompt to push new flow to live agent

**Recommended Airtable columns to add manually (new):**
`product_interest`, `primary_goal`, `family_stage`, `employment_stage`, `urgency_level`, `objection_reason`, `callback_requested`, `appointment_ready`, `call_summary`, `extracted_need_signals`
