-- Drop existing policies that could cause infinite recursion
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can manage gallery" ON public.campaign_gallery;
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;

-- Create security definer functions to prevent infinite recursion in RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create secure policies using security definer functions
CREATE POLICY "Admins can manage campaigns" ON public.campaigns
  FOR ALL USING (public.is_admin_or_manager());

CREATE POLICY "Admins can manage gallery" ON public.campaign_gallery
  FOR ALL USING (public.is_admin_or_manager());

CREATE POLICY "Admins can manage news" ON public.news
  FOR ALL USING (public.is_admin_or_manager());

CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
  FOR SELECT USING (public.is_admin_or_manager());

-- Add additional security policies
CREATE POLICY "Users can only read their own profile data" ON public.profiles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

-- Ensure contact submissions are time-limited and rate-limited
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Create function to validate email format
CREATE OR REPLACE FUNCTION public.is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add email validation to contact submissions
ALTER TABLE public.contact_submissions 
ADD CONSTRAINT valid_email_format 
CHECK (public.is_valid_email(email));

-- Add constraints to prevent malicious data
ALTER TABLE public.contact_submissions 
ADD CONSTRAINT name_length_check CHECK (char_length(name) BETWEEN 2 AND 100),
ADD CONSTRAINT message_length_check CHECK (char_length(message) BETWEEN 10 AND 2000),
ADD CONSTRAINT phone_format_check CHECK (phone ~ '^[\+]?[0-9\-\(\)\s]{7,20}$' OR phone IS NULL);

-- Add constraints to other tables
ALTER TABLE public.news 
ADD CONSTRAINT title_length_check CHECK (char_length(title) BETWEEN 5 AND 200),
ADD CONSTRAINT content_length_check CHECK (char_length(content) BETWEEN 50 AND 50000);

ALTER TABLE public.campaign_gallery 
ADD CONSTRAINT title_length_check CHECK (char_length(title) BETWEEN 3 AND 150),
ADD CONSTRAINT caption_length_check CHECK (char_length(caption) BETWEEN 10 AND 500 OR caption IS NULL);

-- Create function to sanitize HTML input (basic XSS prevention)
CREATE OR REPLACE FUNCTION public.sanitize_html(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove script tags and other dangerous HTML
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi'),
      '<[^>]*(javascript|onclick|onload|onerror)[^>]*>', '', 'gi'
    ),
    '(<|>|&lt;|&gt;)', '', 'g'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add trigger to sanitize contact form submissions
CREATE OR REPLACE FUNCTION public.sanitize_contact_submission()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name = public.sanitize_html(NEW.name);
  NEW.message = public.sanitize_html(NEW.message);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sanitize_contact_before_insert
  BEFORE INSERT ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_contact_submission();

-- Add rate limiting table for contact submissions
CREATE TABLE IF NOT EXISTS public.rate_limit_contact (
  ip_address INET PRIMARY KEY,
  submission_count INTEGER DEFAULT 0,
  last_submission TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reset_time TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '1 hour')
);

-- Enable RLS on rate limiting table
ALTER TABLE public.rate_limit_contact ENABLE ROW LEVEL SECURITY;

-- Create policy for rate limiting (only allow reading your own IP data)
CREATE POLICY "Rate limit access policy" ON public.rate_limit_contact
  FOR ALL USING (ip_address = inet_client_addr());

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit(client_ip INET)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  last_reset TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current count and reset time
  SELECT submission_count, reset_time INTO current_count, last_reset
  FROM public.rate_limit_contact 
  WHERE ip_address = client_ip;
  
  -- If no record exists, create one and allow submission
  IF current_count IS NULL THEN
    INSERT INTO public.rate_limit_contact (ip_address, submission_count, last_submission, reset_time)
    VALUES (client_ip, 1, now(), now() + INTERVAL '1 hour');
    RETURN TRUE;
  END IF;
  
  -- If reset time has passed, reset counter
  IF now() > last_reset THEN
    UPDATE public.rate_limit_contact 
    SET submission_count = 1, last_submission = now(), reset_time = now() + INTERVAL '1 hour'
    WHERE ip_address = client_ip;
    RETURN TRUE;
  END IF;
  
  -- Check if under rate limit (max 5 submissions per hour)
  IF current_count < 5 THEN
    UPDATE public.rate_limit_contact 
    SET submission_count = submission_count + 1, last_submission = now()
    WHERE ip_address = client_ip;
    RETURN TRUE;
  END IF;
  
  -- Rate limit exceeded
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;