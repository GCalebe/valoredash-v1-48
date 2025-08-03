-- Enable Row Level Security on existing tables that have policies but RLS disabled
-- This fixes the critical security vulnerabilities

-- Enable RLS on custom_fields table
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

-- Enable RLS on funnel_data table
ALTER TABLE public.funnel_data ENABLE ROW LEVEL SECURITY;

-- Enable RLS on invoice_items table
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Enable RLS on invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Enable RLS on kanban_stages table
ALTER TABLE public.kanban_stages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on knowledge_article_tags table
ALTER TABLE public.knowledge_article_tags ENABLE ROW LEVEL SECURITY;

-- Enable RLS on knowledge_base table
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Enable RLS on knowledge_categories table
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on knowledge_comments table
ALTER TABLE public.knowledge_comments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on knowledge_ratings table
ALTER TABLE public.knowledge_ratings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on knowledge_tags table
ALTER TABLE public.knowledge_tags ENABLE ROW LEVEL SECURITY;

-- Enable RLS on n8n_chat_histories table
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on n8n_chat_memory table
ALTER TABLE public.n8n_chat_memory ENABLE ROW LEVEL SECURITY;

-- Enable RLS on payment_methods table
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Enable RLS on performance_metrics table
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on system_alerts table
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_sessions table
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_settings table
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_storage_usage table
ALTER TABLE public.user_storage_usage ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_usage_metrics table
ALTER TABLE public.user_usage_metrics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on utm_tracking table
ALTER TABLE public.utm_tracking ENABLE ROW LEVEL SECURITY;