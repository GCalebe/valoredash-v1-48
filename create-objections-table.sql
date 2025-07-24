-- Create product_objections table
CREATE TABLE IF NOT EXISTS product_objections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES ai_products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_objections_product_id ON product_objections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_objections_created_at ON product_objections(created_at);

-- Enable RLS
ALTER TABLE product_objections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view product objections" ON product_objections
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert product objections" ON product_objections
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own product objections" ON product_objections
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own product objections" ON product_objections
  FOR DELETE USING (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_objections_updated_at
  BEFORE UPDATE ON product_objections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();