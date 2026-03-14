
## Problem

The existing outbound agent (`agent_99c3c436ddbd135950c48586fc`, flow `conversation_flow_3ddcd04483f1`) has a `wrap_up` node with `edges: []`. This leaves the call open with no termination — Retell has nowhere to go and the call just hangs. An explicit `end_call` node is needed at the end of every path.

## What needs to change

### 1. Patch the existing agent's flow via Retell API
The flow `conversation_flow_3ddcd04483f1` needs to be PATCHed to:
- Add a new `end_call` node (Retell's built-in type that immediately terminates the call, with a final "Goodbye" utterance)
- Update the `wrap_up` node's `edges` to point to `end_call`

This is a one-time fix applied via the Retell API PATCH endpoint.

### 2. Fix `buildOutboundFlowNodes` in `create-retell-agent/index.ts`
All future outbound agents will also have the same issue. Update the builder to include the `end_call` node and wire `wrap_up` → `end_call`.

## Implementation

**File: `supabase/functions/create-retell-agent/index.ts`**

Update `buildOutboundFlowNodes` — change `wrap_up` to have an edge to `end_call`, and add an `end_call` terminal node:

```text
wrap_up  →  end_call
```

The `end_call` node shape (Retell API):
```json
{
  "id": "end_call",
  "type": "end_call",
  "speak_during_execution": true,
  "speak_during_execution_prompt": "Thank {{first_name}} for their time and say a warm goodbye."
}
```

**One-time patch for existing agent** — after deploying the updated edge function, call the Retell API directly inside the function OR create a small utility function that patches the existing flow. Since we already have `create-retell-agent` deployed and the flow ID is known, the cleanest approach is:

Add a new lightweight edge function `patch-retell-flow` (or inline it) that sends a PATCH to:
```
https://api.retellai.com/update-conversation-flow/conversation_flow_3ddcd04483f1
```
with the corrected nodes (including `end_call`). This can be triggered once from the UI or called automatically.

Alternatively — the simplest single approach: update `create-retell-agent/index.ts` with the fix for future agents, AND add a one-time PATCH call inside a new edge function `fix-existing-outbound-flow` that patches `conversation_flow_3ddcd04483f1` with the corrected node set.

## Summary of files to edit
- `supabase/functions/create-retell-agent/index.ts` — fix `buildOutboundFlowNodes` to add `end_call` node + wire `wrap_up` edges
- New edge function `supabase/functions/fix-existing-outbound-flow/index.ts` — one-time PATCH to update the live flow `conversation_flow_3ddcd04483f1` with the corrected nodes (including `end_call`)
