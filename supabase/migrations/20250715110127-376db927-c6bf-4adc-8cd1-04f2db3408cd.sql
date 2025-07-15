-- Add visit tracking to user_analytics table
ALTER TABLE public.user_analytics 
ADD COLUMN total_visits integer DEFAULT 0,
ADD COLUMN last_visit_at timestamp with time zone DEFAULT now();

-- Create index for better performance on visits
CREATE INDEX idx_user_analytics_last_visit ON public.user_analytics(last_visit_at);

-- Update existing users to have default visit count
UPDATE public.user_analytics 
SET total_visits = 1, last_visit_at = now() 
WHERE total_visits IS NULL;