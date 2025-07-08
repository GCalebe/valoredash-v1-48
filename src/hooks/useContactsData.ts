import { useState, useCallback } from "react";
import { Contact } from "@/types/client";
import { toast } from "@/hooks/use-toast";
import { generateFictitiousConversations } from "@/utils/fictitiousMessages";
// Mock data removed - using Supabase integration
import { useAuth } from "@/context/AuthContext";
import { useContactsQuery, useUpdateContactMutation } from "./useContactsQuery";
import { useContactsService } from "./useContactsService";

export const useContactsData = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { data: contacts = [], isLoading: loadingContacts, refetch } = useContactsQuery();
  const updateContactMutation = useUpdateContactMutation();
  const { updateContactKanbanStage } = useContactsService();
  
  // For backward compatibility, provide setContacts function
  const setContacts = () => {
    // This is now handled by React Query cache
    console.warn('setContacts is deprecated with React Query. Use mutations instead.');
  };

  // Store contacts in localStorage to persist between page refreshes
  const saveContactsToLocalStorage = (contacts: Contact[]) => {
    try {
      const userId = user?.id || 'anonymous';
      localStorage.setItem(`contacts_${userId}`, JSON.stringify(contacts));
    } catch (error) {
      console.error("Error saving contacts to localStorage:", error);
    }
  };

  // Load contacts from localStorage
  const loadContactsFromLocalStorage = (): Contact[] | null => {
    try {
      const userId = user?.id || 'anonymous';
      const storedContacts = localStorage.getItem(`contacts_${userId}`);
      if (storedContacts) {
        return JSON.parse(storedContacts);
      }
    } catch (error) {
      console.error("Error loading contacts from localStorage:", error);
    }
    return null;
  };

  const fetchClients = useCallback(async () => {
    try {
      setRefreshing(true);
      console.log("Refetching clients from React Query");
      await refetch();
    } catch (error) {
      console.error("Error refetching clients:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Problema ao buscar os dados dos clientes.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleKanbanStageChange = async (
    contactId: string,
    newStage: string,
  ) => {
    try {
      // Update using React Query mutation
      await updateContactMutation.mutateAsync({
        id: contactId,
        data: { kanban_stage: newStage }
      });
      
      toast({
        title: "Etapa atualizada",
        description: `Cliente movido para ${newStage}.`,
      });
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
    fetchClients();
    toast({
      title: "Atualizando dados",
      description: "Os dados da tabela estão sendo atualizados.",
    });
  };

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