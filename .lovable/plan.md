

## Create "Save Customer Info" API for Retell AI Custom Functions

### What This Does

Creates a new backend function that Retell AI can call **mid-conversation** (via a Custom Function node in the flow) to save collected customer data to the database in real-time -- rather than waiting until the call ends.

This means lead data gets persisted as soon as the agent gathers it, so even if a call drops, the information is already saved.

### How It Works

```text
Retell AI Flow (e.g. after "contact_capture" node)
        |
        v
Custom Function call --> POST /functions/v1/save-customer-info
        |
        v
Edge function receives extracted variables
        |
        v
Looks up agent by retell_agent_id
        |
        v
Creates or updates lead in database
        |
        v
Returns lead_id + status back to Retell
```

### Implementation Details

**1. New Edge Function: `supabase/functions/save-customer-info/index.ts`**

- Public endpoint (no JWT -- called by Retell AI servers)
- Accepts POST with JSON body containing:
  - `agent_id` (Retell agent ID to identify the org)
  - `call_id` (Retell call ID for linking)
  - Customer fields: `caller_name`, `phone`, `email`, `timeline`, `budget_min`, `budget_max`, `financing_status`, `pre_approved`, `preferred_locations`, `bedrooms`, `bathrooms`, `must_haves`, `motivation_reason`, `has_agent`
- Looks up the internal agent + org by `retell_agent_id`
- Runs lead classification (HOT/WARM/COLD/DISQUALIFIED) using the same logic as the webhook
- Upserts a lead record (creates new or updates existing if same call_id already has a lead)
- Creates a call record stub if one doesn't exist yet for this `call_id`
- Returns `{ success: true, lead_id, score, status }` so Retell can use the result in subsequent flow nodes

**2. Update `supabase/config.toml`**

- Add `[functions.save-customer-info]` with `verify_jwt = false` (external Retell call)

### Retell AI Setup (Manual Step)

After deployment, you'll configure a **Custom Function** node in your Retell conversation flow with:

- **URL:** `https://qkjufptrgneockakeoth.supabase.co/functions/v1/save-customer-info`
- **Method:** POST
- **Parameters:** Map the extracted dynamic variables (caller_name, phone, email, etc.) from earlier flow nodes
- Place this node after `contact_capture` (or wherever data collection completes) and before the `summary` node

### Security Considerations

- The endpoint validates that the `agent_id` maps to a real agent in the database
- Input validation with length limits on all string fields
- No sensitive data exposure in responses
- Uses service role key internally (same pattern as retell-webhook)

