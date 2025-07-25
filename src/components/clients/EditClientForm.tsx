
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/client";
import { useDynamicFields } from "@/hooks/useDynamicFields";
import ClientInfo from "./ClientInfo";

interface EditClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContact: Contact | null;
  onSave: (updatedContact: Contact) => Promise<void>;
}

/**
 * Componente para edição de cliente
 */
const EditClientForm: React.FC<EditClientFormProps> = ({
  isOpen,
  onClose,
  selectedContact,
  onSave,
}) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { dynamicFields, refetch } = useDynamicFields(selectedContact?.sessionId || null);

  useEffect(() => {
    if (isOpen && selectedContact) {
      console.log("Setting contact data for editing:", selectedContact);
      setContact({ ...selectedContact });
      refetch();
    }
  }, [isOpen, selectedContact, refetch]);

  const handleFieldUpdate = (fieldId: string, newValue: unknown) => {
    if (!contact) return;

    console.log("Field updated:", fieldId, newValue);

    // Verifica se é um campo personalizado ou um campo padrão
    if (fieldId.startsWith("custom_")) {
      const actualFieldId = fieldId.replace("custom_", "");
      setContact({
        ...contact,
        customValues: {
          ...contact.customValues,
          [actualFieldId]: newValue,
        },
      });
    } else {
      setContact({
        ...contact,
        [fieldId]: newValue,
      });
    }
  };

  const handleSave = async () => {
    if (!contact) return;

    try {
      setIsSaving(true);
      console.log("Saving contact:", contact);
      await onSave(contact);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setContact(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente: {selectedContact?.name}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {contact && (
            <ClientInfo
              clientData={contact}
              dynamicFields={dynamicFields}
              onFieldUpdate={handleFieldUpdate}
              context="edit"
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientForm;
