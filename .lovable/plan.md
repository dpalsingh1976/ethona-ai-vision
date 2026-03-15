
## What This Does

The uploaded JSON contains an improved 16-node conversation flow for the agent `agent_99c3c436ddbd135950c48586fc`. The plan:

1. **Update the conversation flow** (`conversation_flow_3ddcd04483f1`) via Retell's PATCH API with all new nodes, global prompt, tools, model choice, and default dynamic variables from the uploaded JSON
2. **Publish the agent** (`agent_99c3c436ddbd135950c48586fc`) via Retell's PATCH agent API with `is_published: true`

---

## What's New in the Improved Flow

The uploaded flow adds 8 new nodes vs the current 8-node flow:

| New Nodes | Purpose |
|-----------|---------|
| `permission_bridge` | Micro-value hook before discovery — earns 60s of attention |
| `soft_objection_greeting` | Handles soft pushback at greeting (curious/resistant, not hard no) |
| `value_bridge` | Mirrors discovery findings back before pitching |
| `live_transfer` | Warm transfer to advisor with `transfer_call` tool |
| `schedule_appointment` | Captures preferred meeting day/time/format |
| `voicemail` | Dedicated voicemail node (explicit routing, not keyword-detected) |
| `wrong_number` | Handles wrong number gracefully |
| `gatekeeper` | Handles spouse/assistant who answers |

Also adds:
- Updated global prompt with silence handling, energy mirroring, AI disclosure rule
- `transfer_call` tool with warm transfer prompt
- Model upgraded to `gpt-4.1` (cascading)
- Richer `extract_dynamic_variable` on discovery (emotional signals, advisor status as string enum)

---

## Implementation

### 1. Create new edge function: `update-outbound-agent`

A one-shot edge function that:
- PATCHes the conversation flow `conversation_flow_3ddcd04483f1` with all nodes, global prompt, tools, model, and default variables from the JSON
- PATCHes agent `agent_99c3c436ddbd135950c48586fc` with `is_published: true`
- Returns success/error

This follows the same pattern as `fix-existing-outbound-flow/index.ts`.

### 2. Auto-invoke on deploy

The edge function will be deployed and then called via `supabase--curl_edge_functions` to execute the update immediately — no manual trigger needed.

---

## Files to Create/Edit

- **`supabase/functions/update-outbound-agent/index.ts`** — new one-shot function with full flow payload from the JSON + publish call
- **`supabase/config.toml`** — register the new function

The edge function will be auto-deployed and immediately invoked to push the changes to Retell.

---

**Technical note**: The flow PATCH uses `https://api.retellai.com/update-conversation-flow/{flow_id}` and the agent publish uses `https://api.retellai.com/update-agent/{agent_id}` — both already used by existing functions in this project.
