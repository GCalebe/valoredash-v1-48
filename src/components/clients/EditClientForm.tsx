
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDynamicFields } from "@/hooks/useDynamicFields";
import ClientInfo from "./ClientInfo";
import ClientUTMData from "./ClientUTMData";

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
  const [activeTab, setActiveTab] = useState("principal");
  const [isSaving, setIsSaving] = useState(false);
  const { dynamicFields, refetch } = useDynamicFields(selectedContact?.sessionId || null);

  useEffect(() => {
    if (isOpen && selectedContact) {
      setContact({ ...selectedContact });
      refetch();
    }
  }, [isOpen, selectedContact, refetch]);

  const handleFieldUpdate = (fieldId: string, newValue: any) => {
    if (!contact) return;

    // Verifica se é um campo personalizado ou um campo padrão
    if (fieldId.startsWith("custom_")) {
      setContact({
        ...contact,
        customValues: {
          ...contact.customValues,
          [fieldId]: newValue,
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
      await onSave(contact);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente: {selectedContact?.name}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="principal">Principal</TabsTrigger>
              <TabsTrigger value="utm">UTM</TabsTrigger>
              <TabsTrigger value="custom">Personalizado</TabsTrigger>
              <TabsTrigger value="docs">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="principal" className="space-y-4">
              {contact && (
                <ClientInfo
                  clientData={contact}
                  dynamicFields={dynamicFields}
                  onFieldUpdate={handleFieldUpdate}
                  context="edit"
                />
              )}
            </TabsContent>

            <TabsContent value="utm" className="space-y-4">
              {contact?.id ? (
                <ClientUTMData contactId={contact.id} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Os dados UTM estarão disponíveis após salvar o cliente.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              {contact && (
                <ClientInfo
                  clientData={contact}
                  dynamicFields={dynamicFields}
                  onFieldUpdate={handleFieldUpdate}
                  context="edit"
                />
              )}
            </TabsContent>

            <TabsContent value="docs" className="space-y-4">
              {contact && (
                <ClientInfo
                  clientData={contact}
                  dynamicFields={dynamicFields}
                  onFieldUpdate={handleFieldUpdate}
                  context="edit"
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
