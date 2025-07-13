-- Add a status column to contact submissions for request processing
ALTER TABLE public.contact_submissions 
ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed'));

-- Add an index for better performance on status queries
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);

-- Create a function to send password reset emails (placeholder for edge function integration)
CREATE OR REPLACE FUNCTION public.request_password_reset(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;