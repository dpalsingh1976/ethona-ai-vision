
## Plan: Add `{{advisor_website}}` Dynamic Variable from Airtable

### What needs to change

Three functions pull lead data from Airtable. All three need to be updated to read the `advisor_website` field. Then the voicemail node in `update-outbound-agent` needs to replace the hardcoded URL with `{{advisor_website}}`.

**Assumption**: The Airtable `LEAD_INSURANCE_TABLE` has a field named `advisor_website` (or variations like `Advisor_Website` / `"Advisor Website"`) storing per-lead website URLs.

---

### Files to Edit

| File | Change |
|------|--------|
| `supabase/functions/initiate-outbound-call/index.ts` | Add `advisor_website` to `AirtableLead` interface, map it from Airtable fields, inject into `retell_llm_dynamic_variables` |
| `supabase/functions/outbound-pre-call/index.ts` | Add `advisor_website` to `leadContext` returned from Airtable |
| `supabase/functions/fetch-airtable-leads/index.ts` | Add `advisor_website` to the lead mapping object |
| `supabase/functions/update-outbound-agent/index.ts` | Replace hardcoded `theprosperityfinancial.com` in voicemail node with `{{advisor_website}}`, and update URL rule accordingly |

---

### Detailed Changes

**1. `initiate-outbound-call/index.ts`**
- Add `advisor_website: string` to `AirtableLead` interface (line ~31)
- Map it from Airtable fields: `fields.advisor_website || fields.Advisor_Website || fields["Advisor Website"] || ""`
- Inject into `retell_llm_dynamic_variables` alongside the other variables (line ~133): `advisor_website: leadData.advisor_website`

**2. `outbound-pre-call/index.ts`**
- Add `advisor_website` to `leadContext` object (line ~106–114): `advisor_website: fields.advisor_website || fields.Advisor_Website || fields["Advisor Website"] || ""`

**3. `fetch-airtable-leads/index.ts`**
- Add `advisor_website` to the lead mapping (line ~68–82): `advisor_website: f.advisor_website || f.Advisor_Website || f["Advisor Website"] || ""`

**4. `update-outbound-agent/index.ts` — Voicemail Node (lines 729–744)**

Replace current hardcoded script with `{{advisor_website}}`:

```ts
text: `You've reached {{first_name}}'s voicemail. Leave a compelling, human-sounding message that creates curiosity and gives them a clear next step.

SCRIPT:
"Hi {{first_name}}, this is {{agent_name}} calling on behalf of {{advisor_name}}. I had a quick question for you about your retirement strategy — specifically around tax-free income and making sure your family is properly protected. If you get a chance before we connect, {{advisor_name}}'s team has a free 5-minute risk assessment at {{advisor_website}} — it gives you a personalized picture of where you stand. If you'd like to chat, feel free to reach us back[PHONE_FALLBACK]. Hope to connect soon — have a great day!"

Replace [PHONE_FALLBACK] with: " at {{transfer_number}}" if {{transfer_number}} is available, otherwise omit it entirely.

RULES:
- Keep the voicemail under 25 seconds when spoken
- Sound warm and natural — like a real person leaving a message, not reading a script
- Speak the URL naturally — read it as a web address (e.g. "the prosperity financial dot com")
- If {{advisor_website}} is empty, omit the website reference entirely
- Do NOT mention specific products, prices, or sales language
- Do NOT reference {{original_interest}} — keep it general
- End with a genuine, upbeat tone`,
```

After all four files are saved, the `update-outbound-agent` edge function will be redeployed and triggered automatically to push the updated flow (with `{{advisor_website}}` as a dynamic variable placeholder) live to Retell agent `agent_99c3c436ddbd135950c48586fc`.
