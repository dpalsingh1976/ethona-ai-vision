
## Problem

The `outbound-post-call` edge function is failing to write **any** Airtable updates because it tries to set a field called `recording` which doesn't exist in the Airtable base. Airtable rejects the entire PATCH request when even one field name is unknown — so `call_status`, `last_called`, `notes`, `interest_level`, and all other fields also fail to write.

**Evidence from logs:**
```
Airtable update failed: {"error":{"type":"UNKNOWN_FIELD_NAME","message":"Unknown field name: \"recording\""}}
```

This happened for both `call_ended` and `call_analyzed` events — all data was lost.

## Fix

**File: `supabase/functions/outbound-post-call/index.ts`**

Remove the `recording` field from the Airtable updates block (line 137-139). The recording URL is already saved to the local `calls` table via `recording_url` — it just shouldn't be pushed to Airtable where the column doesn't exist.

```
// REMOVE these 3 lines:
if (call.recording_url) {
  updates.recording = call.recording_url;
}
```

This single change unblocks all the other fields. Once `recording` is removed, the PATCH will succeed and `call_status`, `last_called`, `notes`, `interest_level`, `timeline`, `next_action`, etc. will all write correctly to Airtable.

## What will work after the fix

On `call_ended`:
- `call_status` → `"answered"` / `"voicemail"` / `"no_answer"`
- `last_called` → today's date

On `call_analyzed` (additionally):
- `interest_level`
- `timeline`
- `has_existing_coverage`
- `working_with_advisor`
- `transfer_attempted`
- `next_action`
- `notes` (from call summary)

## Files to edit
- `supabase/functions/outbound-post-call/index.ts` — remove the 3 lines that set `updates.recording`
