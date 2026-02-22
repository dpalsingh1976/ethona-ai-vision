

## Add "Test Call" Feature for Agents

Allow users to test their AI voice agent directly from the dashboard using their browser microphone, instead of going to the Retell AI platform.

### How It Works

```text
User clicks "Test Call" on Agent Card
        |
        v
Frontend calls edge function: create-web-call
        |
        v
Edge function calls Retell API: POST /v2/create-web-call
  (with agent's retell_agent_id + RETELL_API_KEY)
        |
        v
Returns access_token to frontend
        |
        v
Frontend uses retell-client-js-sdk to start a live voice call
        |
        v
User speaks with their AI agent in the browser
```

### Changes

**1. New Edge Function: `supabase/functions/create-web-call/index.ts`**

- Authenticated endpoint (validates user JWT + org membership)
- Accepts `{ agent_id }` (internal DB agent ID)
- Looks up the agent's `retell_agent_id` from the database
- Calls Retell API `POST https://api.retellai.com/v2/create-web-call` with the Retell agent ID
- Returns `{ access_token, call_id }` to the frontend

**2. Update `supabase/config.toml`**

- Add `[functions.create-web-call]` with `verify_jwt = false` (JWT validated in code)

**3. Install `retell-client-js-sdk` npm package**

- Provides `RetellWebClient` class for browser-based voice calls

**4. New Component: `src/components/ai-agent/AgentTestCall.tsx`**

- Slide-over panel (similar to existing `AgentTestPanel`)
- "Start Call" button that:
  - Requests microphone permission
  - Calls the `create-web-call` edge function
  - Starts the call via `RetellWebClient.startCall({ accessToken })`
- Shows call status (connecting, active, ended)
- Displays a live audio indicator / timer
- "End Call" button to stop the call
- Listens to SDK events: `call_started`, `call_ended`, `agent_start_talking`, `agent_stop_talking`, `error`

**5. Update `AgentCard.tsx`**

- Add a "Test Call" option in the dropdown menu (alongside existing "View Flow" and "Delete")
- Uses a phone/mic icon

**6. Update `src/pages/ai-agent/Agents.tsx`**

- Add state for the test-call agent (separate from the flow-view agent)
- Render the `AgentTestCall` component when active

### Technical Details

- The Retell Web SDK handles WebRTC audio streaming automatically
- Microphone permission is requested by the browser when the call starts
- The edge function ensures only org members can test their own agents
- No additional secrets needed -- uses existing `RETELL_API_KEY`
