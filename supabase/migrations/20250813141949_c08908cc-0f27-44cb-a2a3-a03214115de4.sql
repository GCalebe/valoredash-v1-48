-- Add contact_id to conversations table to link with clients
ALTER TABLE conversations ADD COLUMN contact_id UUID REFERENCES contacts(id);

-- Create index for better performance
CREATE INDEX idx_conversations_contact_id ON conversations(contact_id);

-- Update existing conversations to link with contacts based on session_id and phone
UPDATE conversations 
SET contact_id = contacts.id
FROM contacts 
WHERE conversations.session_id = contacts.session_id 
   OR conversations.phone = contacts.phone;

-- Create a function to automatically create a contact when a conversation is created without one
CREATE OR REPLACE FUNCTION create_contact_for_orphan_conversation()
RETURNS TRIGGER AS $$
BEGIN
    -- If the conversation doesn't have a contact_id, try to find or create one
    IF NEW.contact_id IS NULL THEN
        -- Try to find existing contact by phone or session_id
        SELECT id INTO NEW.contact_id
        FROM contacts
        WHERE (NEW.phone IS NOT NULL AND phone = NEW.phone)
           OR (NEW.session_id IS NOT NULL AND session_id = NEW.session_id)
        LIMIT 1;
        
        -- If no contact found, create a new one
        IF NEW.contact_id IS NULL AND NEW.phone IS NOT NULL THEN
            INSERT INTO contacts (
                name, 
                phone, 
                session_id, 
                user_id,
                created_at,
                updated_at
            ) VALUES (
                COALESCE(NEW.name, 'Cliente ' || substring(NEW.phone from 1 for 10)),
                NEW.phone,
                NEW.session_id,
                auth.uid(),
                NOW(),
                NOW()
            ) RETURNING id INTO NEW.contact_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;