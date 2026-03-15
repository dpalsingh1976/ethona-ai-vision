
## Root Cause

The AI is asking "what prompted you to reach out to ACME" because:

1. **Question 9 in the discovery node** reads: `"Is there a specific reason this topic has been on your mind lately?"` — this is benign, but the LLM interprets "top of mind" / "reach out" framing as inbound context and generates inbound-style follow-up language.

2. **Neither the global prompt nor the discovery node explicitly state this is an outbound call** — so the LLM defaults to inbound phrasing ("what brought you to us", "what prompted you to reach out").

3. **The live agent (`conversation_flow_3ddcd04483f1`) may still be running an old version** — `fix-existing-outbound-flow` will need to be re-invoked after the fix.

---

## Fix — 3 targeted changes

### 1. Global prompt — add outbound context

Add one explicit line to the top of `GLOBAL_PROMPT` in both files:

```
IMPORTANT: This is an OUTBOUND call. YOU are calling the lead — they did not reach out to you. Never use inbound-style language like "what prompted you to reach out", "what brought you to us", or "how can I help you today".
```

### 2. Discovery node — remove/reword question 9

Replace:
```
9. "Is there a specific reason this topic has been on your mind lately?" → infers trigger / urgency
```

With an outbound-safe alternative:
```
9. "Have there been any big changes in your life recently — new job, new home, growing family — that have you thinking about your financial situation?" → infers trigger / urgency (outbound-safe framing)
```

This detects the same urgency signal but is clearly framed as the AI probing, not asking why the lead called in.

### 3. Discovery node — reinforce outbound context in opening

Add one line at the very top of the discovery node prompt:

```
CONTEXT: You are on an outbound call — YOU called {{first_name}}. Do not ask why they reached out or what brought them to you.
```

---

## Files to edit

- **`supabase/functions/fix-existing-outbound-flow/index.ts`** — update `GLOBAL_PROMPT`, discovery node opening context line, and question 9. Then re-invoke this function to push to the live agent.
- **`supabase/functions/create-retell-agent/index.ts`** — same three changes in `buildOutboundFlowNodes()` to keep future agents in sync.
