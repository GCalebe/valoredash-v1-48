
ALTER POLICY "FAQ items podem ser gerenciados por usuários autenticados" ON faq_items
    WITH CHECK (auth.role() = 'service_role');
