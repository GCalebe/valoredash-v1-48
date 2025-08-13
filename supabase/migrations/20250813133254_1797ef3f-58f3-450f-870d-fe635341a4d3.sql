-- Create table for client product interests
CREATE TABLE public.client_products_interest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  product_id UUID NOT NULL,
  interest_level TEXT CHECK (interest_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(client_id, product_id)
);

-- Create table for client product purchases
CREATE TABLE public.client_product_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  product_id UUID NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_value NUMERIC(10,2),
  quantity INTEGER DEFAULT 1,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')) DEFAULT 'completed',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.client_products_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_product_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_products_interest
CREATE POLICY "Users can view their clients product interests" 
ON public.client_products_interest 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = client_products_interest.client_id 
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can create their clients product interests" 
ON public.client_products_interest 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = client_products_interest.client_id 
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can update their clients product interests" 
ON public.client_products_interest 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = client_products_interest.client_id 
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can delete their clients product interests" 
ON public.client_products_interest 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = client_products_interest.client_id 
  AND contacts.user_id = auth.uid()
));

-- RLS Policies for client_product_purchases
CREATE POLICY "Users can view their clients product purchases" 
ON public.client_product_purchases 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = client_product_purchases.client_id 
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can create their clients product purchases" 
ON public.client_product_purchases 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = client_product_purchases.client_id 
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can update their clients product purchases" 
ON public.client_product_purchases 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = client_product_purchases.client_id 
  AND contacts.user_id = auth.uid()
));

CREATE POLICY "Users can delete their clients product purchases" 
ON public.client_product_purchases 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.contacts 
  WHERE contacts.id = client_product_purchases.client_id 
  AND contacts.user_id = auth.uid()
));

-- Create triggers for updated_at
CREATE TRIGGER update_client_products_interest_updated_at
BEFORE UPDATE ON public.client_products_interest
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_client_product_purchases_updated_at
BEFORE UPDATE ON public.client_product_purchases
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();