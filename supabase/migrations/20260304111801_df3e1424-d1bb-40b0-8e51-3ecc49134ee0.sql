
-- Step 1: Create is_admin_or_manager_or_moderator() function
CREATE OR REPLACE FUNCTION public.is_admin_or_manager_or_moderator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager', 'moderator')
  );
$$;

-- Step 2a: Fix user_posts - drop old, create new
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.user_posts;
CREATE POLICY "Staff can manage all posts"
  ON public.user_posts FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager_or_moderator())
  WITH CHECK (public.is_admin_or_manager_or_moderator());

-- Step 2b: Fix profiles - remove overly permissive SELECT, update restrictive one
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can only read their own profile data" ON public.profiles;
CREATE POLICY "Users can read own profile or staff can read all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_manager_or_moderator());

-- Step 2c: Fix user_analytics - update admin policy, tighten INSERT
DROP POLICY IF EXISTS "Admins can manage all analytics" ON public.user_analytics;
CREATE POLICY "Staff can manage all analytics"
  ON public.user_analytics FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager_or_moderator())
  WITH CHECK (public.is_admin_or_manager_or_moderator());

DROP POLICY IF EXISTS "System can insert user analytics" ON public.user_analytics;
CREATE POLICY "System can insert user analytics"
  ON public.user_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Step 2d: Fix user_levels - update admin policy, tighten INSERT
DROP POLICY IF EXISTS "Admins can manage all levels" ON public.user_levels;
CREATE POLICY "Staff can manage all levels"
  ON public.user_levels FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager_or_moderator())
  WITH CHECK (public.is_admin_or_manager_or_moderator());

DROP POLICY IF EXISTS "System can insert user levels" ON public.user_levels;
CREATE POLICY "System can insert user levels"
  ON public.user_levels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Step 2e: Tighten contact_submissions INSERT
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (public.is_valid_email(email));
