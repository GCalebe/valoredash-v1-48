-- Migração para criar registros na tabela calendar_events para appointments existentes
-- e atualizar a coluna calendar_event_id nos appointments

-- Primeiro, criamos uma função que será usada pelo trigger
CREATE OR REPLACE FUNCTION create_calendar_event_from_appointment()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir um novo registro na tabela calendar_events
    INSERT INTO calendar_events (
        title,
        description,
        start_time,
        end_time,
        all_day,
        status,
        contact_id,
        user_id,
        host_name
    ) VALUES (
        NEW.appointment_type, -- title
        NEW.notes, -- description
        NEW.appointment_date, -- start_time
        (NEW.appointment_date::timestamp + (NEW.duration_minutes || ' minutes')::interval)::text, -- end_time
        FALSE, -- all_day
        NEW.status, -- status
        NEW.contact_id, -- contact_id
        NEW.user_id, -- user_id
        NEW.assigned_user -- host_name
    )
    RETURNING id INTO NEW.calendar_event_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger para novos appointments
CREATE TRIGGER appointment_calendar_event_trigger
BEFORE INSERT ON appointments
FOR EACH ROW
WHEN (NEW.calendar_event_id IS NULL)
EXECUTE FUNCTION create_calendar_event_from_appointment();

-- Criar o trigger para atualizações de appointments
CREATE TRIGGER appointment_calendar_event_update_trigger
BEFORE UPDATE ON appointments
FOR EACH ROW
WHEN (OLD.calendar_event_id IS NULL OR 
      OLD.appointment_date != NEW.appointment_date OR
      OLD.duration_minutes != NEW.duration_minutes OR
      OLD.appointment_type != NEW.appointment_type OR
      OLD.notes != NEW.notes OR
      OLD.status != NEW.status OR
      OLD.assigned_user != NEW.assigned_user)
EXECUTE FUNCTION create_calendar_event_from_appointment();

-- Agora, vamos criar calendar_events para appointments existentes que não têm calendar_event_id
DO $$
DECLARE
    appointment_record RECORD;
BEGIN
    FOR appointment_record IN 
        SELECT * FROM appointments WHERE calendar_event_id IS NULL
    LOOP
        -- Inserir um novo registro na tabela calendar_events
        WITH new_event AS (
            INSERT INTO calendar_events (
                title,
                description,
                start_time,
                end_time,
                all_day,
                status,
                contact_id,
                user_id,
                host_name
            ) VALUES (
                appointment_record.appointment_type, -- title
                appointment_record.notes, -- description
                appointment_record.appointment_date, -- start_time
                (appointment_record.appointment_date::timestamp + (appointment_record.duration_minutes || ' minutes')::interval)::text, -- end_time
                FALSE, -- all_day
                appointment_record.status, -- status
                appointment_record.contact_id, -- contact_id
                appointment_record.user_id, -- user_id
                appointment_record.assigned_user -- host_name
            )
            RETURNING id
        )
        -- Atualizar o appointment com o novo calendar_event_id
        UPDATE appointments
        SET calendar_event_id = (SELECT id FROM new_event)
        WHERE id = appointment_record.id;
    END LOOP;
END;
$$;