
-- Adicionar coluna para dias disponíveis na tabela employees
ALTER TABLE public.employees 
ADD COLUMN available_days TEXT[] DEFAULT '{}';

-- Criar tabela para associar funcionários com produtos/serviços
CREATE TABLE public.employee_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  available_days TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.employee_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employee_services
CREATE POLICY "Users can view their own employee services" 
ON public.employee_services 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employee services" 
ON public.employee_services 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employee services" 
ON public.employee_services 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employee services" 
ON public.employee_services 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_employee_services_updated_at
BEFORE UPDATE ON public.employee_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
