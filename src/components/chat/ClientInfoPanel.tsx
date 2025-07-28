
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/types/chat";
import { useDynamicFields } from "@/hooks/useDynamicFields";
import { useContactsQuery } from "@/hooks/useContactsQuery";
import { useClientDataFetch } from "@/hooks/useClientDataFetch";
import TagsField from "./TagsField";
import NotesField from "./NotesField";
import ClientInfo from "@/components/clients/ClientInfo";

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
    <div className="h-full w-full flex flex-col min-w-0 overflow-hidden">
      {/* Header com título */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          Informações do Cliente
        </h2>
      </div>
      
      <ScrollArea className="flex-1 w-full min-w-0">
        <div className="p-3 space-y-4 min-w-0 w-full">
          {/* Tags Field */}
          <div className="min-w-0 w-full">
            <TagsField selectedChat={selectedChat} />
          </div>

          {/* Painel de Informações */}
          <div className="min-w-0 w-full">
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
          </div>

          {/* Notes Field */}
          <div className="min-w-0 w-full">
            <NotesField selectedChat={selectedChat} />
          </div>

          {/* Display validation errors if any */}
          <div className="min-w-0 w-full">
            <ValidationErrors validationErrors={validationErrors} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ClientInfoPanel;
