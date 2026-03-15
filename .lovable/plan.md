
## The Bug

The `greeting` node prompt has two separate, loosely ordered instruction blocks that a large language model can mis-sequence:

1. The `If {{original_interest}}...` conditional sits as its own paragraph
2. The "Greet {{first_name}} warmly…" instruction sits as a separate paragraph below it

Because these are not tightly merged, the AI can interpret the greeting instruction as a secondary step — leading it to ask an opener question ("What do you need?") **before** properly greeting the lead. The discovery node's fallback question `"What's more top of mind for you right now..."` is also being fired too early.

---

## Fix

### Greeting node — merge into one clean sequential block

Replace the fragmented two-paragraph structure with a single tightly-ordered prompt that:
1. States who is calling and on whose behalf
2. Greets `{{first_name}}` by first name
3. Introduces as an assistant calling on behalf of `{{advisor_name}}`
4. **Then** conditionally weaves in `{{original_interest}}` ONLY as part of the soft reason for calling (not as a standalone paragraph)
5. Asks permission to continue: `"Did I catch you at an okay time for a quick minute?"`

**New unified greeting prompt:**
```
You are calling on behalf of {{advisor_name}}. The lead's name is {{first_name}} {{last_name}}.

Greet {{first_name}} warmly by first name. Introduce yourself as an AI assistant calling on behalf of {{advisor_name}}. Keep the reason for the call soft and low-pressure.

If {{original_interest}} is available and non-empty, use it as light context to personalize the reason for the call — e.g. "I understand you may have been looking into [topic] — we wanted to follow up on that." Do NOT read the value verbatim; weave it in naturally as part of the introduction.
If {{original_interest}} is empty or unknown, simply give a warm general opener about helping individuals and families explore retirement planning and life insurance options — do NOT reference their original interest at all.

Ask: "Did I catch you at an okay time for a quick minute?"

Keep the greeting brief, warm, and human. Do not ask any discovery questions here. Do not launch into a pitch.
```

The key addition: **"Do not ask any discovery questions here."** — this explicitly prevents the AI from firing discovery logic during the greeting.

### Discovery node — no structural change needed

The discovery node prompt text the user provided in their message **exactly matches** what is currently in both files. It is correct. No changes needed there. The root cause was the greeting leaking into discovery, not the discovery node itself.

---

## Files to edit

- **`supabase/functions/fix-existing-outbound-flow/index.ts`** — update `greeting` node prompt (lines ~43–52). This is the live deployed flow and will be re-pushed to `conversation_flow_3ddcd04483f1`.
- **`supabase/functions/create-retell-agent/index.ts`** — update `greeting` node prompt in `buildOutboundFlowNodes()` (lines ~250–259) to keep future agents in sync.

After both file edits, the `fix-existing-outbound-flow` edge function is automatically deployed and will need to be invoked to push the updated greeting prompt to the live Retell agent.
