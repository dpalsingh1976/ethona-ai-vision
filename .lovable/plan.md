
## Two-Part Plan

### Part 1 — Sync Agent Flow from Retell

The agent `agent_99c3c436ddbd135950c48586fc` has been edited directly in the Retell UI. The local `published_workflow` in our database is stale. We need a way to pull the live flow from Retell and save it back to the DB.

**New edge function: `sync-agent-flow`**

Calls two Retell APIs:
1. `GET /get-agent/{agent_id}` → get the agent's `llm_websocket_url` or `voice_temperature`, etc., to confirm it's alive
2. `GET /get-conversation-flow/{flow_id}` → fetch the live nodes/edges (flow_id = `conversation_flow_3ddcd04483f1`)

Then UPSERTs `published_workflow` and `updated_at` on the matching `agents` row in the DB.

**"Sync from Retell" button in `AgentCard`** (shown only for agents with a `retell_agent_id`):
- Calls the new edge function with the agent's `retell_agent_id` and `retell_flow_id`
- Shows a loading spinner, then "Synced" toast on success
- Invalidates the `agents` query so `View Flow` immediately reflects the latest data

---

### Part 2 — Visual Flowchart in `AgentTestPanel`

The current panel is a flat vertical list of node cards with raw node IDs and badge arrows. Replacing it with a proper flowchart using **React Flow** (`@xyflow/react`) — already a common dependency in Vite/React projects.

**Layout**:
- Each node rendered as a styled card with: icon, friendly label (mapped from ID), node type badge, and a 2-line truncated prompt snippet
- Edges rendered as animated arrows with labels from `transition_condition.prompt` (truncated to ~6 words)
- Color-coded by node type:
  - `conversation` → blue/primary
  - `logic_split` → orange
  - terminal nodes (`end_call`, `wrap_up`, `not_interested`) → grey
  - action nodes (`voicemail`, `schedule_appointment`, `live_transfer`) → green

**Node label mapping** (friendly names instead of raw IDs):
```
greeting           → Greeting
permission_bridge  → Permission Check
discovery          → Discovery
soft_objection_greeting → Soft Objection
value_bridge       → Value Mirror
objection_handler  → Objection Handler
live_transfer      → Live Transfer
schedule_appointment → Schedule Appointment
callback           → Schedule Callback
voicemail          → Voicemail
wrong_number       → Wrong Number
gatekeeper         → Gatekeeper
wrap_up            → Wrap Up
not_interested     → Not Interested / DNC
end_call           → End Call
```

**Layout strategy**: Use a simple left-to-right dagre-style manual positioning using the `display_position` fields already present in each node's data (Retell stores x/y). Fall back to auto-stacked layout if positions are missing.

**Panel changes**: Replace the `AgentTestPanel` component entirely with a full-width modal/dialog (not a side panel) — 90vw × 90vh — giving the flowchart room to breathe. The "Lead Classification Logic" and "Data Extraction Fields" summary sections move into a collapsible sidebar within the modal.

---

### Files to Create/Edit

| File | Change |
|------|--------|
| `supabase/functions/sync-agent-flow/index.ts` | New — fetches live Retell flow and saves to DB |
| `supabase/config.toml` | Register `sync-agent-flow` |
| `src/components/ai-agent/AgentTestPanel.tsx` | Replace flat list with React Flow flowchart in full-screen modal |
| `src/components/ai-agent/AgentCard.tsx` | Add "Sync from Retell" menu item that calls the new function |
| `src/hooks/useAgents.ts` | Add `useSyncAgentFlow` mutation hook |

**React Flow** (`@xyflow/react`) will be installed as a new dependency.

---

### How Sync Works (data flow)

```text
User clicks "Sync from Retell"
        ↓
AgentCard → useSyncAgentFlow(agent.id, agent.retell_agent_id, agent.retell_flow_id)
        ↓
Edge Function: sync-agent-flow
  GET api.retellai.com/get-conversation-flow/{flow_id}
        ↓
  Supabase UPDATE agents SET published_workflow = <live nodes>, updated_at = now()
  WHERE retell_agent_id = agent_id
        ↓
Client: invalidate ["agents"] query → AgentTestPanel now shows live flow
```
