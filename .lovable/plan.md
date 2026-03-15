
## Root Cause

The `callStatusBadge()` function in `Dashboard.tsx` only handles three hardcoded lowercase values:
- `"answered"`
- `"voicemail"` 
- `"no_answer"`

But the actual values written to Airtable by `outbound-post-call/index.ts` are:
- `"Connected - Interested"` (line 166)
- `"Voicemail Left"` (line 162)
- `"No Answer"` (line 163/168)

None of these match the switch cases, so everything falls to the `default` → "Pending" badge.

---

## Fix — Dashboard.tsx only

Update `callStatusBadge()` to match the real Airtable values. Also update the stats calculation in `useOutboundCallResults.ts` which counts `"answered"` — it needs to match `"connected - interested"` too.

### 1. `callStatusBadge()` — add all real status values

```text
"connected - interested"  →  green  PhoneCall   "Connected"
"connected"               →  green  PhoneCall   "Connected"      (safe fallback)
"voicemail left"          →  yellow PhoneOff    "Voicemail Left"
"voicemail"               →  yellow PhoneOff    "Voicemail"
"no answer"               →  red    PhoneMissed "No Answer"
"no_answer"               →  red    PhoneMissed "No Answer"      (legacy)
"answered"                →  green  PhoneCall   "Answered"       (legacy)
default                   →  gray               raw value (never "Pending" for a real status)
```

### 2. `useOutboundCallResults.ts` — fix `answered` count

The `answered` stat currently only counts records where `call_status === "answered"`. Update to also count `"connected - interested"` and `"connected"`:

```ts
answered: records.filter((r) => {
  const s = r.call_status?.toLowerCase();
  return s === "answered" || s?.includes("connected");
}).length,
```

### Files to edit

- `src/pages/ai-agent/Dashboard.tsx` — update `callStatusBadge()` switch cases
- `src/hooks/useOutboundCallResults.ts` — fix `answered` stat counter
