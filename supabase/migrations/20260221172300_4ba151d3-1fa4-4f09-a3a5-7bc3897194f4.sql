
-- ============================================
-- Ethona Voice Agent Cloud — Full Schema
-- ============================================

-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'agent', 'viewer');

-- 2. Lead status enum
CREATE TYPE public.lead_status AS ENUM ('new', 'qualified', 'warm', 'nurture', 'ready', 'disqualified', 'sent_to_agent');

-- 3. Agent status enum
CREATE TYPE public.agent_status AS ENUM ('draft', 'published', 'paused', 'archived');

-- 4. Appointment status enum
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'no_show', 'cancelled', 'rescheduled');

-- 5. Organizations
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service_area TEXT,
  team_size INT,
  industry TEXT NOT NULL DEFAULT 'real_estate',
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Org members (join table)
CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- 7. User roles (for security definer RLS)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- 8. Integrations (per-org secrets storage)
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  is_connected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, type)
);

-- 9. Agents
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'real_estate',
  status public.agent_status NOT NULL DEFAULT 'draft',
  retell_agent_id TEXT,
  retell_flow_id TEXT,
  company_name TEXT,
  service_areas TEXT[],
  calendly_link TEXT,
  auto_schedule BOOLEAN NOT NULL DEFAULT false,
  phone_number TEXT,
  forwarding_number TEXT,
  voice_persona TEXT DEFAULT 'professional',
  greeting_style TEXT DEFAULT 'friendly',
  draft_workflow JSONB DEFAULT '{}',
  published_workflow JSONB,
  version INT DEFAULT 1,
  last_published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  caller_phone TEXT,
  name TEXT,
  email TEXT,
  desired_areas TEXT[],
  property_type TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  down_payment_estimate NUMERIC,
  pre_approved BOOLEAN,
  financing_status TEXT,
  timeline TEXT,
  motivation_reason TEXT,
  must_haves JSONB DEFAULT '{}',
  motivation_score INT DEFAULT 0,
  score TEXT,
  status public.lead_status NOT NULL DEFAULT 'new',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Calls
CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  retell_call_id TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  transcript TEXT,
  transcript_summary TEXT,
  recording_url TEXT,
  extracted_data JSONB DEFAULT '{}',
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique index for retell_call_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_calls_retell_call_id_unique 
ON public.calls (retell_call_id) 
WHERE retell_call_id IS NOT NULL;

-- 12. Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  property_address TEXT,
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  calendar_provider TEXT,
  external_event_id TEXT,
  outcome TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Weekly reports
CREATE TABLE public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Qualification rules
CREATE TABLE public.qualification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  min_budget NUMERIC,
  require_pre_approval BOOLEAN DEFAULT FALSE,
  min_motivation_score INT DEFAULT 0,
  ready_timeline TEXT DEFAULT '0-3',
  warm_timeline TEXT DEFAULT '3-6',
  send_to_human_rules JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualification_rules ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Security definer functions (avoid recursion)
-- ============================================

CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id
  )
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id AND role IN ('owner', 'admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.org_members WHERE user_id = _user_id
$$;

-- ============================================
-- RLS Policies (all permissive)
-- ============================================

-- Organizations
CREATE POLICY "Members can view their orgs" ON public.organizations
  FOR SELECT USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create orgs" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update their org" ON public.organizations
  FOR UPDATE USING (public.is_org_admin(auth.uid(), id));

-- Org members
CREATE POLICY "Members can view org members" ON public.org_members
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Admins can insert org members" ON public.org_members
  FOR INSERT WITH CHECK (public.is_org_admin(auth.uid(), org_id) OR NOT EXISTS (SELECT 1 FROM public.org_members om WHERE om.org_id = org_members.org_id));

CREATE POLICY "Admins can update org members" ON public.org_members
  FOR UPDATE USING (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "Admins can delete org members" ON public.org_members
  FOR DELETE USING (public.is_org_admin(auth.uid(), org_id));

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Integrations
CREATE POLICY "Members can view integrations" ON public.integrations
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Admins can manage integrations" ON public.integrations
  FOR INSERT WITH CHECK (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "Admins can update integrations" ON public.integrations
  FOR UPDATE USING (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "Admins can delete integrations" ON public.integrations
  FOR DELETE USING (public.is_org_admin(auth.uid(), org_id));

-- Agents
CREATE POLICY "Members can view agents" ON public.agents
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Admins can create agents" ON public.agents
  FOR INSERT WITH CHECK (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "Admins can update agents" ON public.agents
  FOR UPDATE USING (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "Admins can delete agents" ON public.agents
  FOR DELETE USING (public.is_org_admin(auth.uid(), org_id));

-- Leads
CREATE POLICY "Members can view leads" ON public.leads
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Members can create leads" ON public.leads
  FOR INSERT WITH CHECK (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Members can update leads" ON public.leads
  FOR UPDATE USING (public.is_org_member(auth.uid(), org_id));

-- Calls
CREATE POLICY "Members can view calls" ON public.calls
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "System can insert calls" ON public.calls
  FOR INSERT WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- Appointments
CREATE POLICY "Members can view appointments" ON public.appointments
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Members can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Members can update appointments" ON public.appointments
  FOR UPDATE USING (public.is_org_member(auth.uid(), org_id));

-- Weekly reports
CREATE POLICY "Members can view reports" ON public.weekly_reports
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));

-- Qualification rules
CREATE POLICY "Members can view rules" ON public.qualification_rules
  FOR SELECT USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Admins can manage rules" ON public.qualification_rules
  FOR INSERT WITH CHECK (public.is_org_admin(auth.uid(), org_id));

CREATE POLICY "Admins can update rules" ON public.qualification_rules
  FOR UPDATE USING (public.is_org_admin(auth.uid(), org_id));

-- ============================================
-- Updated_at triggers
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qualification_rules_updated_at BEFORE UPDATE ON public.qualification_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Auto-create org on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  INSERT INTO public.organizations (name, industry)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Organization'),
    'real_estate'
  )
  RETURNING id INTO new_org_id;

  INSERT INTO public.org_members (user_id, org_id, role)
  VALUES (NEW.id, new_org_id, 'owner');

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
