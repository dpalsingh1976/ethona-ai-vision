-- Create intake_submissions table for growth assessment form
CREATE TABLE public.intake_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  growth_goal TEXT NOT NULL,
  lead_tracking TEXT NOT NULL,
  biggest_challenge TEXT
);

-- Enable Row Level Security
ALTER TABLE public.intake_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form)
CREATE POLICY "Anyone can submit intake form"
ON public.intake_submissions
FOR INSERT
WITH CHECK (true);

-- Only service role can read submissions (for admin/CRM access)
CREATE POLICY "Only service role can read intake submissions"
ON public.intake_submissions
FOR SELECT
USING (false);

-- Add index on email for potential duplicate checking
CREATE INDEX idx_intake_submissions_email ON public.intake_submissions(email);

-- Add index on created_at for reporting
CREATE INDEX idx_intake_submissions_created_at ON public.intake_submissions(created_at DESC);