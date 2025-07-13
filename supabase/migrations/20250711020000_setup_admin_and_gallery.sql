-- Insert sample campaign
INSERT INTO public.campaigns (title, description, candidate_name, is_active) 
VALUES (
  'Engr. Aliyu Muhammed Cambat 2024 Campaign',
  'Supporting positive change and community development',
  'Engr. Aliyu Muhammed Cambat',
  true
) ON CONFLICT DO NOTHING;

-- Get the campaign ID for gallery insertion
DO $$
DECLARE
    campaign_id_var UUID;
BEGIN
    SELECT id INTO campaign_id_var FROM public.campaigns WHERE is_active = true LIMIT 1;
    
    -- Insert sample gallery images
    INSERT INTO public.campaign_gallery (campaign_id, image_url, title, description, is_active) VALUES
    (campaign_id_var, 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7', 'Leadership Vision', 'Inspiring leadership for positive change', true),
    (campaign_id_var, 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', 'Technology Progress', 'Advancing technology for community development', true),
    (campaign_id_var, 'https://images.unsplash.com/photo-1518770660439-4636190af475', 'Innovation Drive', 'Driving innovation in governance', true),
    (campaign_id_var, 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d', 'Digital Transformation', 'Embracing digital solutions', true),
    (campaign_id_var, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', 'Community Engagement', 'Engaging with the community', true),
    (campaign_id_var, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', 'Future Vision', 'Building a better future together', true),
    (campaign_id_var, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', 'Natural Heritage', 'Protecting our natural resources', true),
    (campaign_id_var, 'https://images.unsplash.com/photo-1501854140801-50d01698950b', 'Sustainable Development', 'Sustainable growth for all', true)
    ON CONFLICT DO NOTHING;
END $$;

-- Create admin policies for campaign management
CREATE POLICY "Admin can manage campaigns" 
ON public.campaigns 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create admin policies for gallery management
CREATE POLICY "Admin can manage gallery" 
ON public.campaign_gallery 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create admin policies for viewing all user posts
CREATE POLICY "Admin can view all user posts" 
ON public.user_posts 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Create admin policies for updating user posts
CREATE POLICY "Admin can update user posts" 
ON public.user_posts 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Create admin policies for viewing profiles
CREATE POLICY "Admin can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Create admin policies for contact submissions
CREATE POLICY "Admin can view contact submissions" 
ON public.contact_submissions 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Create admin policies for news management
CREATE POLICY "Admin can manage news" 
ON public.news 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Function to create admin user (to be called manually)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_email TEXT,
  user_password TEXT,
  full_name TEXT DEFAULT 'Admin User'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  result JSON;
BEGIN
  -- This function should be called from the Supabase dashboard or via API
  -- It cannot create auth users directly from SQL for security reasons
  
  -- Return instructions for manual admin creation
  result := json_build_object(
    'message', 'To create an admin user:',
    'steps', json_build_array(
      '1. Go to Supabase Dashboard > Authentication > Users',
      '2. Click "Add user" and create user with email: ' || user_email,
      '3. After user is created, run this SQL to make them admin:',
      'UPDATE public.profiles SET role = ''admin'', full_name = ''' || full_name || ''' WHERE user_id = (SELECT id FROM auth.users WHERE email = ''' || user_email || ''');'
    )
  );
  
  RETURN result;
END;
$$;

-- Update the trigger function to allow setting custom role and name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'supporter')
  );
  RETURN NEW;
END;
$$;