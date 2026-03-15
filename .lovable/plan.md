
## Problem

The `greeting` node prompt in both `create-retell-agent/index.ts` and `fix-existing-outbound-flow/index.ts` contains this line:

```
Their original interest was: {{original_interest}}.
```

When `original_interest` is empty or missing from Airtable:
- The agent reads out "Their original interest was: ." which sounds broken
- Or the agent has no context at all and gives a generic opener that doesn't connect with the lead

The `discovery` node also has no fallback — it can't tailor its opening question if there's no prior interest signal.

---

## Fix

### 1. `greeting` node prompt — handle missing `original_interest` gracefully

In both files, replace the hard-coded `Their original interest was: {{original_interest}}.` line with conditional phrasing:

**New instruction:**
```
The lead's name is {{first_name}} {{last_name}}.
If {{original_interest}} is available and non-empty, use it as context to personalize the opening — e.g. "I understand you may have been looking into [topic] — we wanted to follow up on that."
If {{original_interest}} is empty or unknown, simply give a general warm opener about retirement planning and life insurance — do NOT mention their original interest at all.
```

This way the agent silently skips the `original_interest` reference when it's absent, and uses it naturally when it is present.

### 2. `discovery` node — add fallback opening question

Add an instruction for when `original_interest` is empty — the agent should open discovery with a broad, low-pressure question like:
```
"What's more top of mind for you right now — making sure your family is protected, or planning ahead for retirement?"
```
This ensures a natural discovery entry point even with no pre-call context.

### 3. `default_dynamic_variables` — no change needed

`original_interest` already defaults to `""` in `DEFAULT_DYNAMIC_VARIABLES` — this is correct and doesn't need to change.

---

## Files to edit

- **`supabase/functions/fix-existing-outbound-flow/index.ts`** — update `greeting` node and `discovery` node prompts with the conditional `original_interest` handling. This is the live deployed flow.
- **`supabase/functions/create-retell-agent/index.ts`** — same update in `buildOutboundFlowNodes()` so newly created agents also get the fix.

After both files are updated, the `fix-existing-outbound-flow` function will be called automatically to push the updated prompts to the live Retell agent (`conversation_flow_3ddcd04483f1`).
