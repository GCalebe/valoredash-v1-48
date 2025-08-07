-- Fix the migration by making role field nullable and providing default values
-- First, let's create the tables correctly

-- Create employees table if it doesn't exist
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on employees table
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'employees' 
    AND policyname = 'Users can manage their own employees'
  ) THEN
    CREATE POLICY "Users can manage their own employees" 
    ON employees FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  duration_minutes INTEGER DEFAULT 60,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on products table  
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'Users can manage their own products'
  ) THEN
    CREATE POLICY "Users can manage their own products" 
    ON products FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Add missing fields to calendar_events table
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS attendance_type TEXT CHECK (attendance_type IN ('presencial', 'online')),
ADD COLUMN IF NOT EXISTS employee_id UUID,
ADD COLUMN IF NOT EXISTS product_id UUID,
ADD COLUMN IF NOT EXISTS service_name TEXT,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_phone TEXT,
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_location TEXT;

-- Update status field to use standardized English values
UPDATE calendar_events 
SET status = CASE 
  WHEN status = 'confirmado' THEN 'confirmed'
  WHEN status = 'pendente' THEN 'pending' 
  WHEN status = 'cancelado' THEN 'cancelled'
  WHEN status = 'agendado' THEN 'scheduled'
  WHEN status = 'concluido' THEN 'completed'
  ELSE COALESCE(status, 'scheduled')
END
WHERE status IN ('confirmado', 'pendente', 'cancelado', 'agendado', 'concluido') 
   OR status IS NULL;

-- Add constraint for standardized status values
ALTER TABLE calendar_events 
DROP CONSTRAINT IF EXISTS calendar_events_status_check;

ALTER TABLE calendar_events 
ADD CONSTRAINT calendar_events_status_check 
CHECK (status IN ('scheduled', 'confirmed', 'pending', 'completed', 'cancelled', 'no_show'));

-- Add foreign key constraints to calendar_events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'calendar_events_employee_id_fkey'
  ) THEN
    ALTER TABLE calendar_events 
    ADD CONSTRAINT calendar_events_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'calendar_events_product_id_fkey'
  ) THEN
    ALTER TABLE calendar_events 
    ADD CONSTRAINT calendar_events_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_employee_id ON calendar_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_product_id ON calendar_events(product_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_attendance_type ON calendar_events(attendance_type);

-- Insert default employees from existing calendar events
INSERT INTO employees (name, user_id, role)
SELECT DISTINCT host_name, user_id, 'employee'
FROM calendar_events 
WHERE host_name IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM employees 
  WHERE employees.name = calendar_events.host_name 
  AND employees.user_id = calendar_events.user_id
)
ON CONFLICT DO NOTHING;

-- Update calendar_events to link with employees
UPDATE calendar_events 
SET employee_id = e.id
FROM employees e
WHERE calendar_events.host_name = e.name 
AND calendar_events.user_id = e.user_id
AND calendar_events.employee_id IS NULL;