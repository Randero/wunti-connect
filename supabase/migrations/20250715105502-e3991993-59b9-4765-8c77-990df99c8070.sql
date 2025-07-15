-- Add account status field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deactivated'));

-- Update any existing suspended users (if they have role = 'suspended')
-- This is a cleanup for the previous incorrect implementation
UPDATE public.profiles 
SET account_status = 'suspended', role = 'user' 
WHERE role = 'suspended';

-- Add index for better performance
CREATE INDEX idx_profiles_account_status ON public.profiles(account_status);

-- Add index for role filtering
CREATE INDEX idx_profiles_role ON public.profiles(role);