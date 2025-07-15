-- Add phone number field to profiles table
ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;

-- Update the handle_new_user function to include phone number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone_number)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$;