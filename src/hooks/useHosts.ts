// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

export type Host = Database['public']['Tables']['employees']['Row'];

export const useHosts = () => {
  const { user } = useAuth();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user?.id)
        .order("name", { ascending: true });

      if (error) throw error;
      setHosts(data as Host[] || []);
    } catch (error) {
      console.error("Erro ao buscar anfitriões:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os anfitriões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchHosts();
    }
  }, [user, fetchHosts]);

  return {
    hosts,
    loading,
    refetch: fetchHosts,
  };
};