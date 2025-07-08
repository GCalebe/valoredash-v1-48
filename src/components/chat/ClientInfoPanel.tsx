
import { useEffect, useState } from "react";
import { Anchor } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Conversation } from "@/types/chat";
import { Contact } from "@/types/client";
import { useThemeSettings } from "@/context/ThemeSettingsContext";
import { useDynamicFields } from "@/hooks/useDynamicFields";
import TagsField from "./TagsField";
import NotesField from "./NotesField";
import ClientInfo from "@/components/clients/ClientInfo";
import { mockClients } from "@/mocks/clientsMock";

interface ClientInfoPanelProps {
  selectedChat: string | null;
  selectedConversation: Conversation | undefined;
}

const ClientInfoPanel = ({
  selectedChat,
  selectedConversation,
}: ClientInfoPanelProps) => {
  const { settings } = useThemeSettings();
  const [clientData, setClientData] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);

  // Use the enhanced dynamic fields hook with validation
  const {
    dynamicFields,
    loading: dynamicFieldsLoading,
    updateField,
    validationErrors,
  } = useDynamicFields(selectedConversation?.sessionId || null);

  // Buscar dados do cliente quando o chat for selecionado
  useEffect(() => {
    const fetchClientData = async () => {
      if (!selectedConversation?.sessionId) return;

      setLoading(true);
      try {
        console.log(
          "Buscando dados do cliente mockup para a sessão:",
          selectedConversation.sessionId,
        );

        // Encontrar o cliente mockup correspondente à sessão selecionada
        const mockClient = mockClients.find(
          (client) => client.sessionId === selectedConversation.sessionId,
        );

        if (mockClient) {
          console.log("Cliente mockup encontrado:", mockClient.name);
          setClientData(mockClient);
        } else {
          console.log(
            "Cliente mockup não encontrado para a sessão:",
            selectedConversation.sessionId,
          );

          // Tentar encontrar por ID como fallback
          const clientById = mockClients.find(
            (client) => client.id === selectedConversation.id,
          );

          if (clientById) {
            console.log("Cliente mockup encontrado por ID:", clientById.name);
            const updatedClient = {
              ...clientById,
              sessionId: selectedConversation.sessionId,
            };
            setClientData(updatedClient);
          } else {
            console.log(
              "Cliente mockup não encontrado nem por ID. Usando dados da conversa como fallback.",
            );
            // Usar os dados da conversa selecionada como fallback
            const fallbackClient: Contact = {
              id: selectedConversation.id,
              name: selectedConversation.name || "Cliente sem nome",
              email: selectedConversation.email || "",
              phone: selectedConversation.phone || "",
              clientName: selectedConversation.clientName || "",
              clientSize: selectedConversation.clientSize || "",
              clientType: selectedConversation.clientType || "pessoa-fisica",
              cpfCnpj: "",
              asaasCustomerId: "",
              status: "Active",
              notes:
                "Cliente gerado automaticamente a partir dos dados da conversa",
              lastContact: new Date().toLocaleDateString("pt-BR"),
              kanbanStage: "Nova consulta",
              sessionId: selectedConversation.sessionId,
              tags: ["Gerado automaticamente"],
              responsibleUser: "",
              sales: 0,
              clientSector: "",
              budget: 0,
              paymentMethod: "",
              clientObjective: "",
              lossReason: "",
              contractNumber: "",
              contractDate: "",
              payment: "",
              uploadedFiles: [],
              consultationStage: "Nova consulta",
            };
            setClientData(fallbackClient);
          }
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [selectedConversation?.sessionId]);

  const handleFieldUpdate = (fieldId: string, newValue: any) => {
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
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <Anchor
          size={64}
          className="mb-4 opacity-50"
          style={{ color: settings.primaryColor }}
        />
        <h3 className="text-xl font-medium mb-2">Informações do Cliente</h3>
        <p className="text-sm text-center px-4">
          Selecione uma conversa para ver as informações do cliente
        </p>
      </div>
    );
  }

  if (loading || dynamicFieldsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm">Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="text-center p-6 border-b border-gray-200 dark:border-gray-700">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
          style={{
            backgroundColor: `${settings.secondaryColor}20`,
            color: settings.primaryColor,
          }}
        >
          ⚓
        </div>
        <h2 className="text-xl font-semibold">
          {clientData?.name || selectedConversation?.name}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          {clientData?.phone || selectedConversation?.phone}
        </p>
        {clientData?.address && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {clientData.address}
          </p>
        )}
        {clientData?.kanbanStage && (
          <Badge variant="outline" className="mt-2">
            {clientData.kanbanStage}
          </Badge>
        )}
      </div>

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
          {Object.keys(validationErrors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Erros de validação:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(validationErrors).map(([fieldId, error]) => (
                  <li key={fieldId}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ClientInfoPanel;
