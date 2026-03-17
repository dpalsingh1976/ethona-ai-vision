
## Feature: Multi-Select & Batch Calling from Airtable

### What the user wants
1. **Select individual leads** or **select all** and call them one by one (sequential batch dialing)
2. The Launch Call dialog needs to support both single-call and batch-call modes

### How it works today
- `LaunchCallDialog` lets you pick **one lead** at a time and call it
- `initiate-outbound-call` fires a single Retell API call per invocation
- `fetch-airtable-leads` returns paginated leads (up to 50 per page, with offset)

---

### Plan

#### 1. Update `LaunchCallDialog.tsx` — multi-select UI
Replace the single-selection model with a **checkbox multi-select** model:

- Add a **"Select All (current page)"** checkbox at the top of the leads list
- Each lead row gets a checkbox — clicking a row toggles selection instead of setting a single `selectedLead`
- A selection count badge shows how many are selected (e.g. "3 selected")
- The CTA button changes contextually:
  - 0 selected → disabled "Select leads to call"
  - 1 selected → "Call [Name]" (same as today)
  - 2+ selected → "Call [N] Leads in Sequence"

**Batch call logic (client-side sequential)**:
When "Call N Leads in Sequence" is clicked:
- Show a progress overlay: "Calling lead 1 of 5…"
- Fire `initiate-outbound-call` for lead #1, wait for response
- Add a **5-second delay** between calls (to avoid Retell rate limits)
- Show per-lead result (✓ success / ✗ failed) as each completes
- After all calls finish, show a summary: "5 calls initiated, 1 failed"

No new edge function needed — the existing `initiate-outbound-call` handles each call individually. The sequential loop runs in the browser.

#### 2. State changes in `LaunchCallDialog.tsx`

```
// Replace:
const [selectedLead, setSelectedLead] = useState<AirtableLead | null>(null);

// With:
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; results: Array<{name: string; success: boolean}> } | null>(null);
```

Toggle logic:
```ts
const toggleLead = (lead) => {
  setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(lead.id) ? next.delete(lead.id) : next.add(lead.id);
    return next;
  });
};
```

Select all:
```ts
const toggleAll = () => {
  if (selectedIds.size === leads.length) {
    setSelectedIds(new Set());
  } else {
    setSelectedIds(new Set(leads.map(l => l.id)));
  }
};
```

#### 3. Batch call handler

```ts
const handleBatchCall = async () => {
  const toCall = leads.filter(l => selectedIds.has(l.id));
  setBatchProgress({ current: 0, total: toCall.length, results: [] });
  
  for (let i = 0; i < toCall.length; i++) {
    const lead = toCall[i];
    setBatchProgress(p => ({ ...p!, current: i + 1 }));
    try {
      await singleCall(lead.to_phone_number, lead.from_phone_number);
      results.push({ name: fullName(lead), success: true });
    } catch {
      results.push({ name: fullName(lead), success: false });
    }
    if (i < toCall.length - 1) await sleep(5000); // 5s gap between calls
  }
  // Show summary toast
};
```

#### 4. Progress UI

When batch is running, replace the leads list with a progress view:
```
Calling leads in sequence…
━━━━━━━━━━━━━━━━━━━━━━━━  2 / 5
✓ Davinder Singh
✓ Rajesh Kumar
⟳ Calling Gurpreet…
```
After completion, show summary and a "Close" button.

---

### Files to edit
- **`src/components/ai-agent/LaunchCallDialog.tsx`** — multi-select checkboxes, Select All, batch progress UI, sequential call loop

No backend changes needed — `initiate-outbound-call` already handles one call per request and the loop runs client-side.
