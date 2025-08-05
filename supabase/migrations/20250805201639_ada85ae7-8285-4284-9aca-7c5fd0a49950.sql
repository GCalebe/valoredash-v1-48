-- Add created_by and updated_by to agenda related insertions to fix RLS policies
-- Also need to update the inserts in the agenda creation process

-- For agenda_reminders inserts, we need to ensure created_by is set
UPDATE agenda_reminders SET created_by = auth.uid() WHERE created_by IS NULL;

-- For agenda_operating_hours inserts, we need to ensure created_by is set  
UPDATE agenda_operating_hours SET created_by = auth.uid() WHERE created_by IS NULL;

-- For agenda_available_dates inserts, we need to ensure created_by is set
UPDATE agenda_available_dates SET created_by = auth.uid() WHERE created_by IS NULL;