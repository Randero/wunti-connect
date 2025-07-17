-- Fix the role constraint check to include all valid roles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add updated constraint that includes all required roles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'moderator', 'manager', 'admin'));

-- Fix account status constraint to be more flexible
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_account_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_account_status_check 
CHECK (account_status IN ('active', 'suspended', 'deactivated', 'pending'));