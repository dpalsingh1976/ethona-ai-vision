
## Plan: Update Voicemail Node with Prosperity Financial Website

### What needs to change

The voicemail node lives in `supabase/functions/update-outbound-agent/index.ts` at lines 729–742. It currently leaves a generic message with no URL reference. We need to:

1. **Rewrite the voicemail script** to be high-converting — creating curiosity, referencing the website naturally, and prompting action
2. **Push the updated flow to Retell** by calling the `update-outbound-agent` function (it PATCHes `conversation_flow_3ddcd04483f1` on the live agent `agent_99c3c436ddbd135950c48586fc`)

---

### New Voicemail Script

Based on the website content — it's a **free financial risk assessment tool** at theprosperityfinancial.com that helps people discover retirement risks, get personalized recommendations, and explore tax-free strategies (IUL, annuities, term life). This is perfect for a voicemail hook.

**New script:**

```
"Hi {{first_name}}, this is {{agent_name}} calling on behalf of {{advisor_name}}. 
I had a quick question for you about your retirement strategy — specifically around 
tax-free income and making sure your family is protected. If you get a chance, you 
can actually check out a free risk assessment {{advisor_name}}'s team put together 
at theprosperityfinancial.com — takes about 5 minutes and gives you a personalized 
picture of where you stand. Hope to connect soon — have a great day!"
```

**Why this is more effective:**
- Opens with a specific hook ("quick question") rather than a generic intro
- Names the concrete benefit (tax-free income, family protection) — not vague "financial protection"
- Gives the lead something actionable to do *right now* (visit the site) so the call isn't wasted even if they don't call back
- The URL doubles as a credibility signal and a warm-up before the callback
- Stays under 25 seconds when spoken naturally
- Includes the phone number fallback if `{{transfer_number}}` is available

---

### Files to Edit

| File | Change |
|------|--------|
| `supabase/functions/update-outbound-agent/index.ts` | Replace voicemail node instruction text (lines 730–742) with refined script + URL |

After updating the file, the user will need to **trigger the `update-outbound-agent` edge function** (via its existing "Sync" mechanism or a direct POST) to push the new voicemail script live to Retell agent `agent_99c3c436ddbd135950c48586fc`.

---

### Updated Voicemail Node (lines 729–742)

```ts
text: `You've reached {{first_name}}'s voicemail. Leave a compelling, human-sounding message that creates curiosity and gives them a clear next step.

SCRIPT:
"Hi {{first_name}}, this is {{agent_name}} calling on behalf of {{advisor_name}}. I had a quick question for you about your retirement strategy — specifically around tax-free income and making sure your family is properly protected. If you get a chance before we connect, {{advisor_name}}'s team has a free 5-minute risk assessment at theprosperityfinancial.com — it gives you a personalized picture of where you stand. If you'd like to chat, feel free to reach us back[PHONE_FALLBACK]. Hope to connect soon — have a great day!"

Replace [PHONE_FALLBACK] with: " at {{transfer_number}}" if {{transfer_number}} is available, otherwise omit it.

RULES:
- Keep the voicemail under 25 seconds when spoken
- Sound warm and natural — like a real person leaving a message, not reading a script
- Speak the URL clearly: "the prosperity financial dot com"
- Do NOT mention specific products, prices, or sales language
- Do NOT reference {{original_interest}} — keep it general
- End with a genuine, upbeat tone`,
```
