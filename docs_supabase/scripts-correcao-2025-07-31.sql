-- INVESTIGAR TABELAS VAZIAS CRÍTICAS

-- Verificar triggers e procedures para contacts
SELECT * FROM information_schema.triggers WHERE event_object_table = 'contacts';
SELECT n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables WHERE relname = 'contacts';

-- Verificar triggers e procedures para profiles
SELECT * FROM information_schema.triggers WHERE event_object_table = 'profiles';
SELECT n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables WHERE relname = 'profiles';

-- Verificar triggers e procedures para n8n_chat_memory
SELECT * FROM information_schema.triggers WHERE event_object_table = 'n8n_chat_memory';
SELECT n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables WHERE relname = 'n8n_chat_memory';

-- Verificar triggers e procedures para n8n_chat_histories
SELECT * FROM information_schema.triggers WHERE event_object_table = 'n8n_chat_histories';
SELECT n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables WHERE relname = 'n8n_chat_histories';

-- Verificar triggers e procedures para user_sessions
SELECT * FROM information_schema.triggers WHERE event_object_table = 'user_sessions';
SELECT n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables WHERE relname = 'user_sessions';

-- Verificar triggers e procedures para user_settings
SELECT * FROM information_schema.triggers WHERE event_object_table = 'user_settings';
SELECT n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables WHERE relname = 'user_settings';
