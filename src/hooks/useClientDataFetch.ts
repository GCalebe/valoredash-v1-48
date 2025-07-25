import { useState, useEffect } from 'react';
import { Contact } from "@/types/client";
import { Conversation } from "@/types/chat";

export const useClientDataFetch = (
  selectedConversation: Conversation | undefined,
  availableContacts: Contact[]
) => {
  const [clientData, setClientData] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!selectedConversation?.sessionId) return;

      setLoading(true);
      try {
        console.log(
          "Buscando dados do cliente mockup para a sessão:",
          selectedConversation.sessionId,
        );

        // Encontrar o cliente correspondente à sessão selecionada
        const client = availableContacts.find(
          (client) => (client as Contact & {sessionId?: string; session_id?: string}).sessionId === selectedConversation.sessionId || (client as Contact & {sessionId?: string; session_id?: string}).session_id === selectedConversation.sessionId,
        );

        if (client) {
          console.log("Cliente encontrado:", client.name);
          setClientData(client);
        } else {
          console.log(
            "Cliente não encontrado para a sessão:",
            selectedConversation.sessionId,
          );

          // Tentar encontrar por ID como fallback
          const clientById = availableContacts.find(
            (client) => client.id === selectedConversation.id,
          );

          if (clientById) {
            console.log("Cliente encontrado por ID:", clientById.name);
            const updatedClient = {
              ...clientById,
              sessionId: selectedConversation.sessionId,
            };
            setClientData(updatedClient);
          } else {
            console.log(
              "Cliente não encontrado nem por ID. Usando dados da conversa como fallback.",
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
  }, [selectedConversation?.sessionId, availableContacts]); // Only depend on sessionId and availableContacts to prevent unnecessary re-renders

  return { clientData, loading };
};