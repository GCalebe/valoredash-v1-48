-- Create a storage bucket for client import templates
INSERT INTO storage.buckets (id, name, public) VALUES ('client-import', 'client-import', true);

-- Create policies for the client-import bucket
CREATE POLICY "Anyone can view client import templates" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'client-import');

CREATE POLICY "Authenticated users can upload client import templates" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'client-import' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update client import templates" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'client-import' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete client import templates" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'client-import' AND auth.role() = 'authenticated');