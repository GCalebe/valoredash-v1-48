-- Create kanban_stages table for storing user-specific Kanban stage configurations
CREATE TABLE public.kanban_stages (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  ordering INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kanban_stages ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can read their own kanban stages" 
ON public.kanban_stages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kanban stages" 
ON public.kanban_stages 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own kanban stages" 
ON public.kanban_stages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kanban stages" 
ON public.kanban_stages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_kanban_stages_updated_at
BEFORE UPDATE ON public.kanban_stages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_kanban_stages();

-- Create index for better performance
CREATE INDEX idx_kanban_stages_user_ordering ON public.kanban_stages(user_id, ordering);