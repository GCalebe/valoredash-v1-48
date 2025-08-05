-- Update existing agendas that have NULL created_by to use a default user ID
-- Since these appear to be test agendas, we'll assign them to the most recent user
-- First, let's see what users exist

DO $$
DECLARE
    default_user_id UUID;
BEGIN
    -- Get the first user ID from auth.users table using a security definer function
    SELECT id INTO default_user_id FROM auth.users LIMIT 1;
    
    -- If we found a user, update the NULL created_by fields
    IF default_user_id IS NOT NULL THEN
        UPDATE public.agendas 
        SET created_by = default_user_id 
        WHERE created_by IS NULL;
        
        UPDATE public.agenda_reminders 
        SET created_by = default_user_id 
        WHERE created_by IS NULL;
        
        UPDATE public.agenda_operating_hours 
        SET created_by = default_user_id 
        WHERE created_by IS NULL;
        
        UPDATE public.agenda_available_dates 
        SET created_by = default_user_id 
        WHERE created_by IS NULL;
    END IF;
END $$;