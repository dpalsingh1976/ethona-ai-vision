
## Current Data Architecture

**Two stores exist today:**

1. **Airtable** (`LEAD_INSURANCE_TABLE`) — one row per lead/phone number. Every call to the same person overwrites the same record. No call history at all.

2. **Supabase `calls` table** — already stores one row per call (`retell_call_id` is the unique key). Each call to the same person creates a new row here. This is already the correct structure for per-call auditing.

So the answer is: **you do NOT need to change the database table structure**. The `calls` table already supports multi-call history correctly. The problem is purely in the dashboard — it reads from Airtable (one row per lead, latest state only) instead of the `calls` table (every call, with full history).

---

## Root Cause of "Interested" on Voicemail

The dashboard's Outbound Activity section calls `fetch-outbound-call-results` → reads from Airtable → returns one row per lead with the overwritten `call_status` + stale `interest_level`. There is no per-call history in Airtable.

The `calls` table in Supabase already has every call with:
- `outcome` = the call_status per call ("Voicemail Left", "Connected - Interested", etc.)
- `extracted_data` = all signal fields (interest_level, notes, next_action, etc.)
- `started_at` / `ended_at` / `duration_seconds`
- `retell_call_id` — unique per call

---

## Plan: Switch Dashboard to Read from `calls` Table (Supabase)

Instead of fetching from Airtable, read the `calls` table directly. This gives per-call accuracy with full call history per person.

### 1. New edge function: `fetch-outbound-calls`

Replace `fetch-outbound-call-results` with a new function that queries the `calls` table, ordered by `started_at DESC`, including the `extracted_data` JSONB field.

```text
SELECT
  id, retell_call_id, outcome, started_at, ended_at, duration_seconds,
  transcript_summary, extracted_data
FROM calls
ORDER BY started_at DESC
LIMIT 50
```

The `extracted_data` already contains: `call_status`, `first_name`, `last_name`, `to_phone_number`, `interest_level`, `next_action`, `notes`, `timeline`, etc. — all populated by `outbound-post-call`.

### 2. Update `useOutboundCallResults` hook

Change the hook to call the new edge function. Map columns from the `calls` table + `extracted_data` into `OutboundCallRecord`. Per-call data means voicemail calls will never show stale `interest_level` from a previous call.

### 3. Update stats logic

Stats become accurate per-call (not per-lead):
- `totalCalled` = total rows
- `answered` = rows where `outcome` includes "connected" or "answered"
- `interested` = rows where `outcome` includes "connected" AND `extracted_data.interest_level` is "high"/"medium"
- `pendingFollowUp` = rows where `extracted_data.next_action` is non-empty

### 4. Dashboard table: add "Date/Time" column

Since we now show per-call rows (not per-lead), replace "Last Called" with "Date / Time" showing `started_at` timestamp + duration. Group by lead name to allow a user to see multiple calls for the same person.

---

## What Changes

| Area | Before | After |
|------|--------|-------|
| Data source | Airtable (1 row/lead) | `calls` table (1 row/call) |
| Voicemail row | shows stale interest | shows correct empty interest |
| Multiple calls | only latest shown | all calls shown |
| Stats accuracy | per-lead counts | per-call counts |

## Files to Edit

- **`supabase/functions/fetch-outbound-calls/index.ts`** — new function reading from `calls` table via Supabase service role
- **`src/hooks/useOutboundCallResults.ts`** — point to new function, remap fields
- **`src/pages/ai-agent/Dashboard.tsx`** — update `ExpandableRow` to show date/time + duration per call; show grouped lead name

No database migration needed.
