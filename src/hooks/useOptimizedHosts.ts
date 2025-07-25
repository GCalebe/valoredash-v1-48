import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type Host = Database['public']['Tables']['employees']['Row'];

// Global cache to avoid multiple API calls
const globalHostsCache: {
  data: Host[];
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

export const useOptimizedHosts = () => {
  const { user } = useAuth();
  const [hosts, setHosts] = useState<Host[]>(globalHostsCache.data);
  const [loading, setLoading] = useState(globalHostsCache.loading);

  const notifyListeners = useCallback(() => {
    globalHostsCache.listeners.forEach(listener => listener());
  }, []);

  const fetchHosts = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    const now = Date.now();
    const isCacheValid = !forceRefresh && (now - globalHostsCache.lastFetch) < CACHE_DURATION;
    
    // If cache is valid and we have data, use it
    if (isCacheValid && globalHostsCache.data.length > 0) {
      setHosts(globalHostsCache.data);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests
    if (globalHostsCache.loading) {
      return;
    }

    try {
      globalHostsCache.loading = true;
      setLoading(true);
      notifyListeners();

      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) throw error;
      
      const hostsData = data as Host[] || [];
      globalHostsCache.data = hostsData;
      globalHostsCache.lastFetch = now;
      
      setHosts(hostsData);
      notifyListeners();
    } catch (error) {
      console.error("Erro ao buscar anfitriões:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os anfitriões.",
        variant: "destructive",
      });
    } finally {
      globalHostsCache.loading = false;
      setLoading(false);
      notifyListeners();
    }
  }, [user, notifyListeners]);

  // Subscribe to cache updates
  useEffect(() => {
    const updateFromCache = () => {
      setHosts(globalHostsCache.data);
      setLoading(globalHostsCache.loading);
    };

    globalHostsCache.listeners.add(updateFromCache);
    
    // Initial fetch if cache is empty or expired or user changed
    if (user && (globalHostsCache.data.length === 0 || 
        (Date.now() - globalHostsCache.lastFetch) > CACHE_DURATION)) {
      fetchHosts();
    }

    return () => {
      globalHostsCache.listeners.delete(updateFromCache);
    };
  }, [user, fetchHosts]);

  return {
    hosts,
    loading,
    refetch: () => fetchHosts(true),
  };
};