
## Three Root Causes Found from Live DB Data

Querying the `calls` table reveals exactly what's happening:

```
retell_call_id: call_7aa1face...  (the 16:06 voicemail call)
outcome: "Connected - Interested"    ← WRONG, should be "Voicemail Left"
extracted_data: { "call_status": "Connected - Interested" }   ← no first_name, last_name, to_phone_number
transcript_summary: "The AI assistant called Davinder on behalf of Ganesh to discuss retirement planning and life insurance options but reached voicemail and left a message."
```

### Issue 1 — "Unknown" name
`initiate-outbound-call` passes `first_name`, `last_name`, `to_phone_number` as **Retell dynamic variables** (`retell_llm_dynamic_variables`). Those are used by the conversation flow to greet the lead, but they are NOT automatically in `custom_analysis_data`. So when `outbound-post-call` runs `...customData` into `extracted_data`, there is no `first_name`/`last_name`/`to_phone_number` — the fields are empty.

**Fix**: In `outbound-post-call`, explicitly write `call.to_number` (the dialed phone) and the name from `customData` or from `call.retell_llm_dynamic_variables` into `extracted_data`.

### Issue 2 — Voicemail showing "Connected - Interested"
The `callStatus` fallback logic:
```
if (call.in_voicemail)           → "Voicemail Left"
else if (disconnection_reason === "dial_no_answer") → "No Answer"
else if (call.transcript)        → "Connected - Interested"   ← BUG
```
For the 16:06 call: `in_voicemail` was falsy (Retell didn't set it), but there WAS a transcript (the AI spoke into voicemail). So it fell to `"Connected - Interested"`.

The transcript_summary clearly says "reached voicemail". We need to detect this.

**Fix**: Add a check — if `call.transcript` or `transcript_summary` contains voicemail keywords (`"voicemail"`, `"left a message"`, `"reached voicemail"`), set `callStatus = "Voicemail Left"`. This runs before the transcript fallback.

### Issue 3 — Interest column empty
`custom_analysis_data` from Retell is empty for all outbound calls (the flow isn't populating it). So `interest_level` is never set. This is a Retell flow config gap, but we can improve the fallback: use `transcript_summary` text to infer interest when `interest_level` is absent.

**Fix for now**: Show "—" for interest when empty (already done). The real fix for interest data requires Retell flow changes — out of scope here. We can display `transcript_summary` in the expanded row for connected calls.

---

## Files to Edit

### 1. `supabase/functions/outbound-post-call/index.ts`
Two targeted changes:

**a) Fix callStatus detection** — before the `else if (call.transcript)` branch, add:
```ts
} else if (
  (call.transcript_summary || "").toLowerCase().includes("voicemail") ||
  (call.transcript || "").toLowerCase().includes("left a message") ||
  (call.transcript || "").toLowerCase().includes("reached voicemail")
) {
  callStatus = "Voicemail Left";
} else if (call.transcript) {
  callStatus = "Connected - Interested";
```

**b) Always write lead identity into extracted_data** — add `to_number`, `first_name`, `last_name` from the Retell call payload and dynamic variables into `extracted_data`:
```ts
extracted_data: {
  ...customData,
  call_status: callStatus,
  // Always store lead identity from call metadata (not just from customData)
  to_phone_number: call.to_number || customData.to_phone_number || "",
  first_name: customData.first_name || call.retell_llm_dynamic_variables?.first_name || "",
  last_name: customData.last_name || call.retell_llm_dynamic_variables?.last_name || "",
}
```

### 2. No frontend changes needed
The `fetch-outbound-calls` function already reads `ext.first_name`, `ext.last_name`, `ext.to_phone_number` from `extracted_data`. Once the backend writes them correctly, names will show up automatically.

The `callStatusBadge` already handles `"voicemail left"` correctly — once the backend writes the right outcome, it will show the yellow Voicemail badge.

---

## Summary

| Issue | Root Cause | Fix Location |
|-------|-----------|-------------|
| "Unknown" name | `first_name`/`last_name` never written to `extracted_data` | `outbound-post-call` |
| Voicemail → "Connected" | `in_voicemail` flag absent; transcript presence → wrong branch | `outbound-post-call` |
| Interest empty | Retell flow not populating `custom_analysis_data` (out of scope) | Retell flow config |

One file to edit, edge function auto-redeploys.
