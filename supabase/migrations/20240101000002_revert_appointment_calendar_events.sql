-- Script para reverter a integração entre appointments e calendar_events

-- Remover os triggers
DROP TRIGGER IF EXISTS appointment_calendar_event_trigger ON appointments;
DROP TRIGGER IF EXISTS appointment_calendar_event_update_trigger ON appointments;

-- Remover a função
DROP FUNCTION IF EXISTS create_calendar_event_from_appointment();

-- Opcional: Limpar os calendar_events criados a partir de appointments
-- Descomente as linhas abaixo se desejar remover os eventos do calendário criados a partir de appointments

/*
DO $$
BEGIN
    -- Obter todos os calendar_event_ids dos appointments
    WITH appointment_events AS (
        SELECT DISTINCT calendar_event_id 
        FROM appointments 
        WHERE calendar_event_id IS NOT NULL
    )
    -- Deletar os calendar_events correspondentes
    DELETE FROM calendar_events
    WHERE id IN (SELECT calendar_event_id FROM appointment_events);
    
    -- Limpar os calendar_event_ids dos appointments
    UPDATE appointments
    SET calendar_event_id = NULL
    WHERE calendar_event_id IS NOT NULL;
    
    RAISE NOTICE 'Limpeza de calendar_events concluída';
END;
$$;
*/