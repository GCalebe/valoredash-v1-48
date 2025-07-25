import { useState, useEffect, useCallback } from "react";
import { useContactsService } from "./useContactsService";
import { Contact } from "@/types/client";
import { toast } from "@/hooks/use-toast";

// Global cache to avoid multiple API calls
const globalContactsCache: {
  data: Contact[];
  loading: boolean;
  lastFetch: number;
  listeners: Set<() => void>;
} = {
  data: [],
  loading: false,
  lastFetch: 0,
  listeners: new Set()
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export const useOptimizedContactsData = () => {
  const [contacts, setContacts] = useState<Contact[]>(globalContactsCache.data);
  const [loadingContacts, setLoadingContacts] = useState(globalContactsCache.loading);
  const [refreshing, setRefreshing] = useState(false);
  
  const { fetchAllContacts, updateContactKanbanStage } = useContactsService();

  const notifyListeners = useCallback(() => {
    globalContactsCache.listeners.forEach(listener => listener());
  }, []);

  const fetchClients = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const isCacheValid = !forceRefresh && (now - globalContactsCache.lastFetch) < CACHE_DURATION;
    
    // If cache is valid and we have data, use it
    if (isCacheValid && globalContactsCache.data.length > 0) {
      setContacts(globalContactsCache.data);
      setLoadingContacts(false);
      return;
    }

    // Prevent multiple simultaneous requests
    if (globalContactsCache.loading) {
      return;
    }

    try {
      globalContactsCache.loading = true;
      setLoadingContacts(true);
      notifyListeners();
      
      console.log("Fetching contacts from Supabase (optimized)...");
      const fetchedContacts = await fetchAllContacts();
      console.log("Fetched contacts (optimized):", fetchedContacts.length);
      
      globalContactsCache.data = fetchedContacts;
      globalContactsCache.lastFetch = now;
      
      setContacts(fetchedContacts);
      notifyListeners();
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Erro ao carregar contatos",
        description: "Não foi possível carregar a lista de contatos.",
        variant: "destructive",
      });
    } finally {
      globalContactsCache.loading = false;
      setLoadingContacts(false);
      notifyListeners();
    }
  }, [fetchAllContacts, notifyListeners]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClients(true);
    setRefreshing(false);
  };

  const handleKanbanStageChange = async (contactId: string, newStageId: string) => {
    try {
      console.log(`[useOptimizedContactsData] Updating contact ${contactId} to stage ${newStageId}`);
      
      // Optimistic update in cache and local state
      const updatedContacts = globalContactsCache.data.map(contact =>
        contact.id === contactId
          ? { ...contact, kanban_stage_id: newStageId, kanbanStage: newStageId }
          : contact
      );
      
      globalContactsCache.data = updatedContacts;
      setContacts(updatedContacts);
      notifyListeners();

      // Update in database
      await updateContactKanbanStage(contactId, newStageId);
      
      console.log(`[useOptimizedContactsData] Successfully updated contact ${contactId} stage`);
      
      toast({
        title: "Estágio atualizado",
        description: "O estágio do contato foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Error updating kanban stage:", error);
      
      // Revert optimistic update on error
      await fetchClients(true);
      
      toast({
        title: "Erro ao atualizar estágio",
        description: "Não foi possível atualizar o estágio do contato.",
        variant: "destructive",
      });
    }
  };

  // Subscribe to cache updates
  useEffect(() => {
    const updateFromCache = () => {
      setContacts(globalContactsCache.data);
      setLoadingContacts(globalContactsCache.loading);
    };

    globalContactsCache.listeners.add(updateFromCache);
    
    // Initial fetch if cache is empty or expired
    const shouldFetch = globalContactsCache.data.length === 0 || 
        (Date.now() - globalContactsCache.lastFetch) > CACHE_DURATION;
    
    if (shouldFetch) {
      fetchClients();
    }

    return () => {
      globalContactsCache.listeners.delete(updateFromCache);
    };
  }, []); // Remove fetchClients from dependencies to prevent infinite loop

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