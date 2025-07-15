-- Create user posts table for tracking post submissions
CREATE TABLE public.user_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_images TEXT[] NOT NULL,
  social_platform TEXT NOT NULL CHECK (social_platform IN ('facebook', 'instagram', 'twitter')),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('airtime', 'data')),
  post_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_post_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user levels table for progression system
CREATE TABLE public.user_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 10),
  experience_points INTEGER NOT NULL DEFAULT 0,
  total_posts INTEGER NOT NULL DEFAULT 0,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  next_level_threshold INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user analytics table for detailed metrics
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_posts INTEGER NOT NULL DEFAULT 0,
  posts_today INTEGER NOT NULL DEFAULT 0,
  posts_this_week INTEGER NOT NULL DEFAULT 0,
  posts_this_month INTEGER NOT NULL DEFAULT 0,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  earnings_today DECIMAL(10,2) NOT NULL DEFAULT 0,
  earnings_this_week DECIMAL(10,2) NOT NULL DEFAULT 0,
  earnings_this_month DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_post_time TIMESTAMP WITH TIME ZONE,
  next_eligible_post_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_posts
CREATE POLICY "Users can view their own posts" 
ON public.user_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" 
ON public.user_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.user_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts" 
ON public.user_posts 
FOR ALL 
USING (is_admin_or_manager());

-- Create RLS policies for user_levels
CREATE POLICY "Users can view their own level" 
ON public.user_levels 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own level" 
ON public.user_levels 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user levels" 
ON public.user_levels 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all levels" 
ON public.user_levels 
FOR ALL 
USING (is_admin_or_manager());

-- Create RLS policies for user_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
ON public.user_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user analytics" 
ON public.user_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all analytics" 
ON public.user_analytics 
FOR ALL 
USING (is_admin_or_manager());

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_posts_updated_at
BEFORE UPDATE ON public.user_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_levels_updated_at
BEFORE UPDATE ON public.user_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at
BEFORE UPDATE ON public.user_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate level progression
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create function to check if user can post (24-hour cooldown)
CREATE OR REPLACE FUNCTION public.can_user_post(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_post_time TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT MAX(created_at) INTO last_post_time
  FROM public.user_posts
  WHERE user_posts.user_id = $1;
  
  -- If no posts or last post was more than 24 hours ago
  RETURN last_post_time IS NULL OR last_post_time < (now() - INTERVAL '24 hours');
END;
$$;

-- Create function to initialize user data
CREATE OR REPLACE FUNCTION public.initialize_user_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create trigger to initialize user data on signup
CREATE TRIGGER on_user_created_initialize_data
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_data();

-- Create function to validate post URL
CREATE OR REPLACE FUNCTION public.is_valid_post_url(url TEXT, platform TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
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
$$;