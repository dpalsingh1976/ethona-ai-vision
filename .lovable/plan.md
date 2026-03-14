
## Plan: Outbound Call Dashboard Section

### What we're building

A dedicated **"Outbound Calls"** section on the Dashboard that pulls live data from Airtable — showing recently called leads with their post-call status, interest level, notes, and next action. This replaces the current generic "Recent Calls" table which only shows Supabase data with limited info.

### Data available from Airtable (via `outbound-post-call`)

After each call, Airtable records get updated with:
- `call_status` — answered / voicemail / no_answer / unknown
- `last_called` — date of last call
- `interest_level` — from AI analysis
- `timeline` — customer timeline
- `has_existing_coverage`, `working_with_advisor`
- `next_action` — AI-recommended follow-up
- `notes` — call summary

The `fetch-airtable-leads` function already returns: `first_name`, `last_name`, `to_phone_number`, `lead_source`, `original_interest`, `advisor_name`, `status`.

### Plan

**1. New edge function: `fetch-outbound-call-results`**

A new lightweight edge function that fetches Airtable records that have been called (i.e. `last_called` is not empty), sorted by `last_called` descending, returning the post-call enrichment fields. This keeps the dashboard query fast and focused.

Fields fetched: `first_name`, `last_name`, `to_phone_number`, `call_status`, `last_called`, `interest_level`, `timeline`, `next_action`, `notes`, `lead_source`, `original_interest`

Filter: `NOT({last_called}='')` — only leads that have actually been called.

**2. New hook: `useOutboundCallResults`**

Simple React Query hook calling the new edge function, with 60s refresh interval.

**3. Dashboard updates — new "Outbound Activity" section**

Add a new section below the existing cards with two parts:

**Outbound Summary mini-cards row** (4 pills):
- Total Outbound Called
- Answered
- Interested (interest_level = "high" or "medium")  
- Pending Follow-up (next_action is set)

**Outbound Call Log table** (last 10 called leads):

| Lead Name | Phone | Status | Interest | Next Action | Last Called |
|---|---|---|---|---|---|
| Jane Smith | +1... | answered | high | Schedule callback | Mar 14 |

- Status badge: green=answered, yellow=voicemail, red=no_answer, gray=unknown
- Interest badge: 🔥 high, 🌡 medium, ❄ low
- Notes shown as tooltip or expandable row
- Empty state if no outbound calls yet

### Files to create/edit

- **New**: `supabase/functions/fetch-outbound-call-results/index.ts`
- **New**: `src/hooks/useOutboundCallResults.ts`
- **Edit**: `src/pages/ai-agent/Dashboard.tsx` — add Outbound Activity section
- **Edit**: `supabase/config.toml` — register new function

### Design approach

- Consistent with existing Dashboard card/table patterns
- Outbound section clearly labeled with a `PhoneOutgoing` icon
- Color-coded status badges (no new dependencies)
- Responsive: full table on desktop, condensed on mobile
- Skeleton loading states matching existing patterns
