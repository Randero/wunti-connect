-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'supporter');

-- Create platform enum for social media
CREATE TYPE public.social_platform AS ENUM ('facebook', 'instagram', 'twitter');

-- Create post status enum
CREATE TYPE public.post_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'supporter',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  candidate_name TEXT NOT NULL DEFAULT 'Engr. Aliyu Muhammed Cambat',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns (public read, admin write)
CREATE POLICY "Anyone can view active campaigns" 
ON public.campaigns 
FOR SELECT 
USING (is_active = true);

-- Create campaign gallery table
CREATE TABLE public.campaign_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on campaign gallery
ALTER TABLE public.campaign_gallery ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign gallery
CREATE POLICY "Anyone can view active gallery images" 
ON public.campaign_gallery 
FOR SELECT 
USING (is_active = true);

-- Create news table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on news
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create policies for news
CREATE POLICY "Anyone can view published news" 
ON public.news 
FOR SELECT 
USING (is_published = true);

-- Create contact submissions table
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for contact submissions
CREATE POLICY "Anyone can insert contact submissions" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create user posts table for tracking social media posts
CREATE TABLE public.user_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id),
  gallery_image_id UUID NOT NULL REFERENCES public.campaign_gallery(id),
  platform social_platform NOT NULL,
  post_url TEXT NOT NULL,
  status post_status NOT NULL DEFAULT 'pending',
  reward_amount DECIMAL(10,2) DEFAULT 0,
  is_rewarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user posts
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for user posts
CREATE POLICY "Users can view their own posts" 
ON public.user_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own posts" 
ON public.user_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create analytics/rewards table
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_posts INTEGER NOT NULL DEFAULT 0,
  total_rewards DECIMAL(12,2) NOT NULL DEFAULT 0,
  facebook_posts INTEGER NOT NULL DEFAULT 0,
  instagram_posts INTEGER NOT NULL DEFAULT 0,
  twitter_posts INTEGER NOT NULL DEFAULT 0,
  pending_posts INTEGER NOT NULL DEFAULT 0,
  approved_posts INTEGER NOT NULL DEFAULT 0,
  rejected_posts INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial analytics row
INSERT INTO public.analytics (id) VALUES (gen_random_uuid());

-- Enable RLS on analytics
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics (only admin/manager can view)
CREATE POLICY "Admin and managers can view analytics" 
ON public.analytics 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_posts_updated_at
  BEFORE UPDATE ON public.user_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
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
    'supporter'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update analytics when posts change
CREATE OR REPLACE FUNCTION public.update_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.analytics SET
    total_posts = (SELECT COUNT(*) FROM public.user_posts),
    facebook_posts = (SELECT COUNT(*) FROM public.user_posts WHERE platform = 'facebook'),
    instagram_posts = (SELECT COUNT(*) FROM public.user_posts WHERE platform = 'instagram'),
    twitter_posts = (SELECT COUNT(*) FROM public.user_posts WHERE platform = 'twitter'),
    pending_posts = (SELECT COUNT(*) FROM public.user_posts WHERE status = 'pending'),
    approved_posts = (SELECT COUNT(*) FROM public.user_posts WHERE status = 'approved'),
    rejected_posts = (SELECT COUNT(*) FROM public.user_posts WHERE status = 'rejected'),
    total_rewards = (SELECT COALESCE(SUM(reward_amount), 0) FROM public.user_posts WHERE is_rewarded = true),
    updated_at = now();
  RETURN NULL;
END;
$$;

-- Create trigger to update analytics
CREATE TRIGGER update_analytics_on_post_change
  AFTER INSERT OR UPDATE OR DELETE ON public.user_posts
  FOR EACH STATEMENT EXECUTE FUNCTION public.update_analytics();