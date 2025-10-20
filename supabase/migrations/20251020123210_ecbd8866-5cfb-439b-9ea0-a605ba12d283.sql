-- Create contact_submissions table to store form data
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit contact form" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Only allow admins to read submissions (you can modify this later)
CREATE POLICY "Only service role can read submissions" 
ON public.contact_submissions 
FOR SELECT 
USING (false);

-- Add index for faster queries
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);