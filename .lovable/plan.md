
## Plan: Fix Voicemail — Use `{{transfer_number}}` Dynamically, Fix URL Rule

### The Issues

1. **Bad URL rule** (line 741): `"Speak the URL naturally as a web address (e.g. 'the prosperity financial dot com')"` — this directly causes the LLM to say "dot com" verbally. Must be removed.
2. **Phone fallback logic is ambiguous** (lines 734–736): The `[PHONE_FALLBACK]` placeholder + separate instruction to "replace" it is confusing the LLM. It needs to be cleaner.

### What to Change

**File**: `supabase/functions/update-outbound-agent/index.ts` — lines 730–745

Replace the voicemail instruction with a version that:
- Keeps `{{transfer_number}}` dynamic (no hardcoding)
- Embeds the phone number inline in the script with a clear conditional rule
- Removes the broken "Speak the URL naturally" rule
- Adds a rule to read the URL **exactly as written** (TTS engine handles pronunciation correctly when not overridden by LLM instructions)

### New Voicemail Node Text

```ts
text: `You've reached {{first_name}}'s voicemail. Read the following script EXACTLY as written — word for word, no paraphrasing.

SCRIPT:
"Hi {{first_name}}, this is {{agent_name}} calling on behalf of {{advisor_name}}. I had a quick question for you about your retirement strategy — specifically around tax-free income and making sure your family is properly protected. If you get a chance before we connect, {{advisor_name}}'s team has a free 5-minute risk assessment at {{advisor_website}} — it gives you a personalized picture of where you stand. Feel free to reach us back at {{transfer_number}}. Hope to connect soon — have a great day!"

RULES:
- Read the script EXACTLY as written — do NOT paraphrase or change any words
- Say the website URL exactly as it appears — do not spell it out or describe it (e.g. do NOT say "dot com" separately)
- Say the phone number exactly as it appears digit group by digit group
- If {{advisor_website}} is empty, omit the website sentence entirely
- If {{transfer_number}} is empty, replace "Feel free to reach us back at {{transfer_number}}." with "Hope we can connect soon!"
- Keep the voicemail under 30 seconds
- Sound warm and natural, not robotic`,
```

### Then Push to Retell

After saving the file, trigger the `update-outbound-agent` edge function to sync the new voicemail node live to agent `agent_99c3c436ddbd135950c48586fc`.

### Files to Edit

| File | Change |
|------|--------|
| `supabase/functions/update-outbound-agent/index.ts` | Replace voicemail node instruction (lines 730–745) |
