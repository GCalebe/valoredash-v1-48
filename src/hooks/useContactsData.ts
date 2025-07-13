
import { useState, useEffect, useCallback } from "react";
import { useContactsService } from "./useContactsService";
import { Contact } from "@/types/client";
import { toast } from "@/hooks/use-toast";

export const useContactsData = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { fetchAllContacts, updateContactKanbanStage } = useContactsService();

  const fetchClients = useCallback(async () => {
    try {
      console.log("Fetching contacts from Supabase...");
      const fetchedContacts = await fetchAllContacts();
      console.log("Fetched contacts:", fetchedContacts.length);
      setContacts(fetchedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Erro ao carregar contatos",
        description: "Não foi possível carregar a lista de contatos.",
        variant: "destructive",
      });
    } finally {
      setLoadingContacts(false);
    }
  }, [fetchAllContacts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  };

  const handleKanbanStageChange = async (contactId: string, newStageId: string) => {
    try {
      console.log(`[useContactsData] Updating contact ${contactId} to stage ${newStageId}`);
      
      // Optimistic update
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === contactId
            ? { ...contact, kanban_stage_id: newStageId, kanbanStage: newStageId }
            : contact
        )
      );

      // Update in database
      await updateContactKanbanStage(contactId, newStageId);
      
      console.log(`[useContactsData] Successfully updated contact ${contactId} stage`);
      
      toast({
        title: "Estágio atualizado",
        description: "O estágio do contato foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error updating kanban stage:", error);
      
      // Revert optimistic update on error
      await fetchClients();
      
      toast({
        title: "Erro ao atualizar estágio",
        description: "Não foi possível atualizar o estágio do contato.",
        variant: "destructive",
      });
    }
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
