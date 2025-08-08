// @ts-nocheck
import React, { useState } from "react";
import ContactHeader from "./contact-info/ContactHeader";
import ContactTabs from "./contact-info/ContactTabs";
import AddCustomFieldDialog from "./AddCustomFieldDialog";
import EditCustomFieldDialog from "./EditCustomFieldDialog";
import { useCustomFields } from "@/hooks/useCustomFields";
import { useDynamicFields } from "@/hooks/useDynamicFields";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline: boolean;
  status?: "online" | "away" | "offline";
  phone?: string;
  email?: string;
  sessionId?: string;
  tags?: string[]; // Adicionar suporte a tags
}

interface EditingField {
  id: string;
  name: string;
  type: string;
  options: string[];
}

interface ContactInfoProps {
  contact: Contact;
  getStatusColor: (status?: string) => string;
  width: number;
  onTagsChange?: (tags: string[]) => void; // Callback para mudanças nas tags
}

export default function ContactInfo({ contact, getStatusColor, width, onTagsChange }: Readonly<ContactInfoProps>) {
  const [addFieldDialogOpen, setAddFieldDialogOpen] = useState(false);
  const [editFieldDialogOpen, setEditFieldDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"basico" | "comercial" | "utm" | "midia">("basico");
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [tags, setTags] = useState<string[]>(contact.tags || []);
  const [newTag, setNewTag] = useState("");

  // Sincronizar mudanças nas tags com o callback
  const updateTags = (newTags: string[]) => {
    setTags(newTags);
    onTagsChange?.(newTags);
  };
  
  // Hooks para campos customizados
  const { fetchCustomFields, deleteCustomField } = useCustomFields();
  const { dynamicFields, updateField, refetch } = useDynamicFields(contact.id);

  // Função para lidar com a adição de novos campos
  const handleFieldAdded = () => {
    refetch();
    fetchCustomFields();
  };

  // Função para abrir o diálogo de adicionar campo
  const handleAddField = (tab: "basico" | "comercial" | "utm" | "midia") => {
    setSelectedTab(tab);
    setAddFieldDialogOpen(true);
  };

  // Função para filtrar campos por categoria/aba
  const getFieldsForTab = (tab: string) => {
    switch (tab) {
      case "basico":
        return dynamicFields.basic || [];
      case "comercial":
        return dynamicFields.commercial || [];
      case "utm":
        return dynamicFields.personalized || []; // UTM pode usar personalized
      case "midia":
        return dynamicFields.documents || [];
      default:
        return [];
    }
  };

  // Função para editar campo
  const handleEditField = (fieldId: string, fieldName: string, fieldType: string, fieldOptions: string[] | null) => {
    setEditingField({
      id: fieldId,
      name: fieldName,
      type: fieldType,
      options: fieldOptions || []
    });
    setEditFieldDialogOpen(true);
  };

  // Função para excluir campo
  const handleDeleteField = async (fieldId: string, fieldName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o campo "${fieldName}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteCustomField(fieldId);
        refetch();
        fetchCustomFields();
      } catch (error) {
        console.error("Erro ao excluir campo:", error);
      }
    }
  };

  // Função para lidar com a edição concluída
  const handleFieldEdited = () => {
    refetch();
    fetchCustomFields();
    setEditingField(null);
  };

  return (
    <div className="bg-background flex flex-col h-full">
      {/* Contact Header */}
      <ContactHeader
        contact={{
          name: contact.name,
          avatar: contact.avatar,
          status: contact.status,
          phone: contact.phone,
          email: contact.email,
        }}
        tags={tags}
        newTag={newTag}
        onNewTagChange={setNewTag}
        onAddTag={() => {
          if (newTag.trim()) {
            updateTags([...tags, newTag.trim()]);
            setNewTag('');
          }
        }}
        onRemoveTag={(tag) => updateTags(tags.filter((t) => t !== tag))}
      />
      
      {/* Tabs Content */}
      <AddCustomFieldDialog
        isOpen={addFieldDialogOpen}
        onClose={() => setAddFieldDialogOpen(false)}
        targetTab={selectedTab}
        onFieldAdded={handleFieldAdded}
      />
      <EditCustomFieldDialog
        isOpen={editFieldDialogOpen}
        onClose={() => setEditFieldDialogOpen(false)}
        field={editingField}
        onFieldEdited={handleFieldEdited}
      />
      <ContactTabs
        getFieldsForTab={getFieldsForTab}
        onAddField={handleAddField}
        onEditField={handleEditField}
        onDeleteField={handleDeleteField}
        onUpdateField={(id, value) => updateField(id, value as any)}
      />
    </div>
  );
}