-- Fix security warning: Add search_path to all functions for security
-- This prevents function search path attacks by ensuring a consistent search path

-- Fix calculate_user_level function
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  total_exp INTEGER;
  level_num INTEGER := 1;
BEGIN
  -- Get total experience points (posts * 10 + earnings * 1)
  SELECT COALESCE(
    (SELECT COUNT(*) * 10 FROM public.user_posts WHERE user_posts.user_id = $1 AND status = 'approved') +
    (SELECT COALESCE(SUM(earnings), 0) FROM public.user_posts WHERE user_posts.user_id = $1 AND status = 'approved')::INTEGER,
    0
  ) INTO total_exp;
  
  -- Calculate level based on experience (exponential growth)
  -- Level 1: 0-99, Level 2: 100-299, Level 3: 300-599, etc.
  WHILE total_exp >= (level_num * 100 + (level_num - 1) * level_num * 50) AND level_num < 10 LOOP
    level_num := level_num + 1;
  END LOOP;
  
  RETURN level_num;
END;
$function$;

-- Fix can_user_post function  
CREATE OR REPLACE FUNCTION public.can_user_post(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  last_post_time TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT MAX(created_at) INTO last_post_time
  FROM public.user_posts
  WHERE user_posts.user_id = $1;
  
  -- If no posts or last post was more than 24 hours ago
  RETURN last_post_time IS NULL OR last_post_time < (now() - INTERVAL '24 hours');
END;
$function$;

-- Fix initialize_user_data function
CREATE OR REPLACE FUNCTION public.initialize_user_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Insert initial user level data
  INSERT INTO public.user_levels (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert initial user analytics data
  INSERT INTO public.user_analytics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Fix is_valid_post_url function
CREATE OR REPLACE FUNCTION public.is_valid_post_url(url text, platform text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = ''
AS $function$
BEGIN
  -- Basic URL validation and platform-specific checks
  IF url IS NULL OR url = '' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for valid URL format
  IF url !~* '^https?://[^\s/$.?#].[^\s]*$' THEN
    RETURN FALSE;
  END IF;
  
  -- Platform-specific validation
  CASE platform
    WHEN 'facebook' THEN
      RETURN url ~* 'facebook\.com|fb\.com';
    WHEN 'instagram' THEN
      RETURN url ~* 'instagram\.com|instagr\.am';
    WHEN 'twitter' THEN
      RETURN url ~* 'twitter\.com|t\.co|x\.com';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone_number, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$function$;

-- Fix is_creating_user_admin function
CREATE OR REPLACE FUNCTION public.is_creating_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$function$;

-- Fix is_admin_or_manager function
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
 RETURNS boolean
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
  );
$function$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$function$;

-- Fix is_valid_email function
CREATE OR REPLACE FUNCTION public.is_valid_email(email text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = ''
AS $function$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$function$;

-- Fix sanitize_html function
CREATE OR REPLACE FUNCTION public.sanitize_html(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = ''
AS $function$
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
$function$;

-- Fix sanitize_contact_submission function
CREATE OR REPLACE FUNCTION public.sanitize_contact_submission()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.name = public.sanitize_html(NEW.name);
  NEW.message = public.sanitize_html(NEW.message);
  RETURN NEW;
END;
$function$;

-- Fix check_contact_rate_limit function
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit(client_ip inet)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Fix request_password_reset function
CREATE OR REPLACE FUNCTION public.request_password_reset(user_email text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  user_exists boolean;
  result json;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE email = user_email
  ) INTO user_exists;
  
  IF user_exists THEN
    -- Return success (the actual reset will be handled by Supabase auth)
    result := json_build_object(
      'success', true,
      'message', 'Password reset email sent'
    );
  ELSE
    -- Return error for non-existent user
    result := json_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;
  
  RETURN result;
END;
$function$;