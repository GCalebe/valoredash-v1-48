import { useState, useEffect, useCallback } from "react";
import { Contact } from "@/types/client";
import { toast } from "@/hooks/use-toast";
import { generateFictitiousConversations } from "@/utils/fictitiousMessages";
import { useContactsService } from "./useContactsService";
import { generateMockClients } from "@/mocks/clientsMock";

export const useContactsData = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const contactsService = useContactsService();

  const fetchClients = useCallback(async () => {
    try {
      setLoadingContacts(true);

      // Use mock data instead of real API calls
      console.log("Using mock data for clients...");
      const mockContactsFetched = generateMockClients();

      // Gera conversas fictícias se necessário.
      let contactsWithConversations =
        generateFictitiousConversations(mockContactsFetched);

      // Ensure all contacts have a valid kanban stage
      contactsWithConversations = contactsWithConversations.map((contact) => ({
        ...contact,
        kanbanStage: contact.kanbanStage || "Entraram",
      }));

      setContacts(contactsWithConversations);

      console.log(
        "Mock clients loaded successfully:",
        contactsWithConversations.length,
        "clients",
      );
    } catch (error) {
      console.error("Error loading mock clients:", error);

      toast({
        title: "Erro ao carregar clientes",
        description:
          "Problema ao buscar os dados dos clientes. Usando dados de exemplo.",
        variant: "destructive",
      });

      // Set mock data on error to prevent app crash
      const fallbackData = generateMockClients();
      setContacts(fallbackData);
    } finally {
      setLoadingContacts(false);
      setRefreshing(false);
    }
  }, []);

  const handleKanbanStageChange = async (
    contactId: string,
    newStage: string,
  ) => {
    try {
      // Update local state immediately for better UX
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === contactId
            ? { ...contact, kanbanStage: newStage }
            : contact,
        ),
      );

      toast({
        title: "Etapa atualizada",
        description: `Cliente movido para ${newStage}.`,
      });

      // In a real app, this would make an API call
      console.log(`Updated contact ${contactId} to stage ${newStage}`);
    } catch (error) {
      console.error("Error updating kanban stage:", error);
      toast({
        title: "Erro ao atualizar etapa",
        description: "Não foi possível atualizar a etapa do cliente.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClients();
    toast({
      title: "Atualizando dados",
      description: "Os dados da tabela estão sendo atualizados.",
    });
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    contacts,
    setContacts,
    loadingContacts,
    refreshing,
    fetchClients,
    handleKanbanStageChange,
    handleRefresh,
  };
};
