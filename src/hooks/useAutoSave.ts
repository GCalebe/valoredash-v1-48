import { useState, useCallback, useRef } from 'react';
import { Contact } from '@/types/client';
import { useOptimizedClientActions } from './useOptimizedClientActions';
import { toast } from '@/hooks/use-toast';

interface AutoSaveConfig {
  enabled: boolean;
  delay: number; // milliseconds
  fields: (keyof Contact)[];
}

const DEFAULT_CONFIG: AutoSaveConfig = {
  enabled: true,
  delay: 2000, // 2 seconds
  fields: ['name', 'email', 'phone', 'notes', 'address'],
};

export const useAutoSave = (
  initialContact: Contact | null,
  config: Partial<AutoSaveConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { updateContactWithFields } = useOptimizedClientActions();
  
  const [contact, setContact] = useState<Contact | null>(initialContact);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const originalContactRef = useRef<Contact | null>(initialContact);

  const saveChanges = useCallback(async (contactToSave: Contact) => {
    if (!originalContactRef.current || !contactToSave) return;

    try {
      setIsSaving(true);
      
      // Only save if there are actual changes
      const hasChanges = finalConfig.fields.some(field => 
        originalContactRef.current![field] !== contactToSave[field]
      );

      if (!hasChanges) {
        setHasUnsavedChanges(false);
        return;
      }

      await updateContactWithFields(
        originalContactRef.current,
        contactToSave,
        undefined,
        () => {
          originalContactRef.current = contactToSave;
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
          
          toast({
            title: "Salvo automaticamente",
            description: "Alterações salvas com sucesso.",
          });
        }
      );
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast({
        title: "Erro no salvamento automático",
        description: "Não foi possível salvar as alterações automaticamente.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [finalConfig.fields, updateContactWithFields]);

  const updateContact = useCallback((field: keyof Contact, value: any) => {
    if (!contact) return;

    const updatedContact = { ...contact, [field]: value };
    setContact(updatedContact);

    // Check if this field should trigger auto-save
    if (finalConfig.enabled && finalConfig.fields.includes(field)) {
      setHasUnsavedChanges(true);
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(() => {
        saveChanges(updatedContact);
      }, finalConfig.delay);
    }
  }, [contact, finalConfig, saveChanges]);

  const forceSave = useCallback(async () => {
    if (contact && hasUnsavedChanges) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      await saveChanges(contact);
    }
  }, [contact, hasUnsavedChanges, saveChanges]);

  const discardChanges = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setContact(originalContactRef.current);
    setHasUnsavedChanges(false);
  }, []);

  const resetContact = useCallback((newContact: Contact | null) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setContact(newContact);
    originalContactRef.current = newContact;
    setHasUnsavedChanges(false);
    setLastSaved(null);
  }, []);

  return {
    contact,
    updateContact,
    hasUnsavedChanges,
    isSaving,
    lastSaved,
    forceSave,
    discardChanges,
    resetContact,
  };
};