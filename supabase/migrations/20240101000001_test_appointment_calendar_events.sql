-- Script para testar a integração entre appointments e calendar_events

-- 1. Teste de inserção de um novo appointment
-- Este teste verifica se o trigger cria automaticamente um calendar_event
-- e atualiza o appointment com o calendar_event_id

DO $$
DECLARE
    new_appointment_id TEXT;
    new_calendar_event_id TEXT;
    contact_id TEXT;
    user_id TEXT;
BEGIN
    -- Obter um contact_id e user_id válidos para o teste
    SELECT id INTO contact_id FROM contacts LIMIT 1;
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    IF contact_id IS NULL OR user_id IS NULL THEN
        RAISE EXCEPTION 'Não foi possível encontrar contact_id ou user_id válidos para o teste';
    END IF;
    
    -- Inserir um novo appointment para teste
    INSERT INTO appointments (
        appointment_date,
        appointment_type,
        contact_id,
        user_id,
        duration_minutes,
        status,
        notes,
        assigned_user
    ) VALUES (
        NOW()::text,
        'Teste de Integração',
        contact_id,
        user_id,
        60,
        'scheduled',
        'Este é um appointment de teste para verificar a integração com calendar_events',
        'Usuário de Teste'
    )
    RETURNING id INTO new_appointment_id;
    
    -- Verificar se o appointment foi criado com um calendar_event_id
    SELECT calendar_event_id INTO new_calendar_event_id 
    FROM appointments 
    WHERE id = new_appointment_id;
    
    IF new_calendar_event_id IS NULL THEN
        RAISE EXCEPTION 'Falha no teste: O appointment foi criado, mas calendar_event_id não foi definido';
    END IF;
    
    -- Verificar se o calendar_event foi criado corretamente
    PERFORM id FROM calendar_events WHERE id = new_calendar_event_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Falha no teste: O calendar_event_id foi definido, mas o evento não existe na tabela calendar_events';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM appointments WHERE id = new_appointment_id;
    
    RAISE NOTICE 'Teste de inserção concluído com sucesso!';
END;
$$;

-- 2. Teste de atualização de um appointment existente
-- Este teste verifica se o trigger atualiza o calendar_event quando o appointment é modificado

DO $$
DECLARE
    test_appointment_id TEXT;
    test_calendar_event_id TEXT;
    contact_id TEXT;
    user_id TEXT;
    original_notes TEXT;
    updated_notes TEXT := 'Notas atualizadas para teste de integração';
BEGIN
    -- Obter um contact_id e user_id válidos para o teste
    SELECT id INTO contact_id FROM contacts LIMIT 1;
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    IF contact_id IS NULL OR user_id IS NULL THEN
        RAISE EXCEPTION 'Não foi possível encontrar contact_id ou user_id válidos para o teste';
    END IF;
    
    -- Inserir um appointment para teste
    INSERT INTO appointments (
        appointment_date,
        appointment_type,
        contact_id,
        user_id,
        duration_minutes,
        status,
        notes,
        assigned_user
    ) VALUES (
        NOW()::text,
        'Teste de Atualização',
        contact_id,
        user_id,
        60,
        'scheduled',
        'Notas originais para teste de integração',
        'Usuário de Teste'
    )
    RETURNING id INTO test_appointment_id;
    
    -- Obter o calendar_event_id gerado
    SELECT calendar_event_id INTO test_calendar_event_id 
    FROM appointments 
    WHERE id = test_appointment_id;
    
    -- Guardar as notas originais do calendar_event
    SELECT description INTO original_notes 
    FROM calendar_events 
    WHERE id = test_calendar_event_id;
    
    -- Atualizar o appointment
    UPDATE appointments
    SET notes = updated_notes
    WHERE id = test_appointment_id;
    
    -- Verificar se o calendar_event foi atualizado
    PERFORM id FROM calendar_events 
    WHERE id = test_calendar_event_id AND description = updated_notes;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Falha no teste: O appointment foi atualizado, mas o calendar_event não foi atualizado';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM appointments WHERE id = test_appointment_id;
    
    RAISE NOTICE 'Teste de atualização concluído com sucesso!';
END;
$$;