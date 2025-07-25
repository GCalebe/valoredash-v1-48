
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/types/chat";
import { useDynamicFields } from "@/hooks/useDynamicFields";
import { useContactsQuery } from "@/hooks/useContactsQuery";
import { useClientDataFetch } from "@/hooks/useClientDataFetch";
import TagsField from "./TagsField";
import NotesField from "./NotesField";
import ClientInfo from "@/components/clients/ClientInfo";
import ClientHeader from "./ClientHeader";
import EmptyClientState from "./EmptyClientState";
import LoadingClientState from "./LoadingClientState";
import ValidationErrors from "./ValidationErrors";

interface ClientInfoPanelProps {
  selectedChat: string | null;
  selectedConversation: Conversation | undefined;
}

const ClientInfoPanel = ({
  selectedChat,
  selectedConversation,
}: ClientInfoPanelProps) => {
  const { data: contacts = [] } = useContactsQuery();
  
  // Custom hook for client data fetching
  const { clientData, loading } = useClientDataFetch(selectedConversation, contacts);

  // Use the enhanced dynamic fields hook with validation
  const {
    dynamicFields,
    loading: dynamicFieldsLoading,
    updateField,
    validationErrors,
  } = useDynamicFields(selectedConversation?.sessionId || null);



  const handleFieldUpdate = (fieldId: string, newValue: unknown) => {
    updateField(fieldId, newValue);
    console.log(`Field ${fieldId} updated with value:`, newValue);

    // Show validation error if exists
    if (validationErrors[fieldId]) {
      console.warn(
        `Validation error for field ${fieldId}:`,
        validationErrors[fieldId],
      );
    }
  };

  if (!selectedChat) {
    return (
      <EmptyClientState
        message="Informações do Cliente"
        subtitle="Selecione uma conversa para ver as informações do cliente"
      />
    );
  }

  if (loading || dynamicFieldsLoading) {
    return <LoadingClientState />;
  }

  return (
    <div className="h-full flex flex-col">
      <ClientHeader clientData={clientData} selectedConversation={selectedConversation} />

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Tags Field */}
          <TagsField selectedChat={selectedChat} />

          {/* Painel de Informações */}
          <ClientInfo
            clientData={clientData}
            dynamicFields={{
              basic: dynamicFields.basic,
              commercial: dynamicFields.commercial,
              personalized: dynamicFields.personalized,
              documents: dynamicFields.documents,
            }}
            onFieldUpdate={handleFieldUpdate}
            context="chat"
          />

          {/* Notes Field */}
          <div className="mt-2">
            <NotesField selectedChat={selectedChat} />
          </div>

          {/* Display validation errors if any */}
          <ValidationErrors validationErrors={validationErrors} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ClientInfoPanel;
