

## Merge Voice Lead AI Dashboard into `/ai-agent`

### Overview
Bring the full AI Agent management dashboard from the Voice Lead AI project into this site, accessible at `/ai-agent`. This includes authentication, a sidebar-based dashboard layout, agent management (CRUD with Retell AI integration), leads tracking, appointments, analytics with charts, phone number management, settings, and call transcript viewing.

### Scope of Changes

This is a large integration involving:
- **9 database tables** with enums, RLS policies, functions, and triggers
- **3 edge functions** (Retell AI integration)
- **8 new pages** nested under `/ai-agent`
- **7 new components** (sidebar, agent cards, dialogs, etc.)
- **5 new hooks** (auth context, agents, analytics, dashboard stats, create agent)
- **Route restructuring** to nest everything under `/ai-agent`

---

### Phase 1: Database Setup

Create all required tables, enums, and functions via database migration:

**Enums:**
- `agent_status`: draft, published, paused, archived
- `app_role`: owner, admin, agent, viewer
- `appointment_status`: scheduled, confirmed, completed, no_show, cancelled, rescheduled
- `lead_status`: new, qualified, warm, nurture, ready, disqualified, sent_to_agent

**Tables:**
- `organizations` - multi-tenant org management
- `org_members` - user-to-org membership with roles
- `user_roles` - user role assignments
- `agents` - AI voice agent configurations (with Retell AI fields)
- `calls` - call records with transcripts, recordings, outcomes
- `leads` - qualified lead data (budget, timeline, scoring)
- `appointments` - scheduled showings/meetings
- `integrations` - third-party service connections
- `qualification_rules` - per-org lead qualification criteria
- `weekly_reports` - weekly metrics snapshots

**Functions (SQL):**
- `get_user_org_ids(user_id)` - returns org IDs for a user
- `has_org_role(org_id, role, user_id)` - checks role membership
- `is_org_admin(org_id, user_id)` - admin check
- `is_org_member(org_id, user_id)` - membership check
- Auto-create org + membership trigger on user signup

**RLS Policies:**
- All tables secured with org-based access control
- Users can only see data belonging to their organization

---

### Phase 2: Edge Functions

Create 3 edge functions:

1. **`create-retell-agent`** - Creates AI voice agent in Retell AI with a full conversation flow (greeting, qualification questions, lead classification, scheduling). Saves agent config and workflow to database.

2. **`fetch-retell-calls`** - Syncs call data from Retell AI API into the database. Matches calls to agents by retell_agent_id.

3. **`retell-webhook`** - Receives webhook events from Retell AI when calls end. Creates leads, call records, and appointments automatically based on extracted conversation data.

**Required Secret:** `RETELL_API_KEY` - needed for Retell AI integration.

---

### Phase 3: Frontend Components

#### New Files to Create:

| File | Purpose |
|------|---------|
| `src/hooks/useAuthContext.tsx` | Auth context provider with org resolution |
| `src/hooks/useAgents.ts` | Agent CRUD queries |
| `src/hooks/useDashboardStats.ts` | Dashboard statistics |
| `src/hooks/useAnalytics.ts` | 30-day analytics data |
| `src/hooks/useCreateRetellAgent.ts` | Create agent mutation via edge function |
| `src/components/ai-agent/AppLayout.tsx` | Sidebar layout wrapper (auth-gated) |
| `src/components/ai-agent/AppSidebar.tsx` | Navigation sidebar |
| `src/components/ai-agent/NavLink.tsx` | Active-state nav link |
| `src/components/ai-agent/AgentCard.tsx` | Agent display card |
| `src/components/ai-agent/AgentTestPanel.tsx` | Agent flow preview panel |
| `src/components/ai-agent/CreateAgentDialog.tsx` | Multi-step agent creation wizard |
| `src/components/ai-agent/CallTranscriptDialog.tsx` | Call transcript viewer |
| `src/pages/ai-agent/Auth.tsx` | Login/signup page |
| `src/pages/ai-agent/Dashboard.tsx` | Stats, recent calls, recent leads |
| `src/pages/ai-agent/Agents.tsx` | Agent list + create |
| `src/pages/ai-agent/Leads.tsx` | Lead management |
| `src/pages/ai-agent/Appointments.tsx` | Appointment calendar |
| `src/pages/ai-agent/Analytics.tsx` | Charts (call volume, lead funnel, agent performance) |
| `src/pages/ai-agent/PhoneNumbers.tsx` | Phone number management |
| `src/pages/ai-agent/SettingsPage.tsx` | Org settings |

#### Files to Modify:

| File | Change |
|------|--------|
| `src/App.tsx` | Add AuthProvider wrapper + nested `/ai-agent` routes |
| `src/pages/AiAgents.tsx` | Update CTA link to point to `/ai-agent/auth` for sign-up |

---

### Phase 4: Routing Structure

All dashboard pages nested under `/ai-agent`:

```text
/ai-agent/auth          -> Login/Signup
/ai-agent               -> Redirect to /ai-agent/dashboard
/ai-agent/dashboard     -> Dashboard (stats overview)
/ai-agent/agents        -> Agent management
/ai-agent/leads         -> Lead tracking
/ai-agent/appointments  -> Appointment management
/ai-agent/analytics     -> Analytics charts
/ai-agent/phone-numbers -> Phone number config
/ai-agent/settings      -> Organization settings
```

The AppLayout component wraps all dashboard routes with:
- Authentication gate (redirects to `/ai-agent/auth` if not logged in)
- Sidebar navigation
- Header with sidebar toggle

---

### Phase 5: Integration Points

**Sidebar navigation** links updated to use `/ai-agent/` prefix for all routes.

**Auth flow:**
- Sign up creates user, triggers auto-org creation
- Sign in redirects to `/ai-agent/dashboard`
- Sign out returns to `/ai-agent/auth`

**Retell AI flow:**
1. User creates agent via CreateAgentDialog (4-step wizard)
2. Edge function creates Retell conversation flow + agent
3. Retell webhooks push call data back to database
4. Dashboard and Analytics pages display real-time data

---

### Technical Notes

- The AuthProvider will be scoped to the `/ai-agent` route subtree only, not the entire site
- All new components go in `src/components/ai-agent/` to avoid conflicts with existing components
- All new pages go in `src/pages/ai-agent/` for clean separation
- Hooks are shared since they don't conflict with existing hooks
- The existing static `/ai-agents` page (agent directory) remains unchanged
- Edge functions in `supabase/functions/` alongside existing ones
- `supabase/config.toml` will need `verify_jwt = false` for the `retell-webhook` function (webhook from external service)

