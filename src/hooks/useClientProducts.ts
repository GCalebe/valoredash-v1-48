import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientProductInterest {
  id: string;
  client_id: string;
  product_id: string;
  interest_level: 'low' | 'medium' | 'high';
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    category?: string;
    description?: string;
  };
}

export interface ClientProductPurchase {
  id: string;
  client_id: string;
  product_id: string;
  purchase_date: string;
  purchase_value?: number;
  quantity: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    category?: string;
    description?: string;
  };
}

export const useClientProducts = (clientId?: string) => {
  const [interests, setInterests] = useState<ClientProductInterest[]>([]);
  const [purchases, setPurchases] = useState<ClientProductPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchInterests = async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_products_interest')
        .select(`
          *,
          product:products(id, name, price, category, description)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInterests(data || []);
    } catch (error) {
      console.error('Error fetching interests:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos de interesse",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchases = async () => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_product_purchases')
        .select(`
          *,
          product:products(id, name, price, category, description)
        `)
        .eq('client_id', clientId)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de compras",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addInterest = async (productId: string, interestLevel: 'low' | 'medium' | 'high' = 'medium', notes?: string) => {
    if (!clientId) return;

    try {
      const { data, error } = await supabase
        .from('client_products_interest')
        .insert({
          client_id: clientId,
          product_id: productId,
          interest_level: interestLevel,
          notes,
        })
        .select(`
          *,
          product:products(id, name, price, category, description)
        `)
        .single();

      if (error) throw error;
      
      setInterests(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Produto adicionado aos interesses",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding interest:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto aos interesses",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateInterest = async (interestId: string, updates: Partial<Pick<ClientProductInterest, 'interest_level' | 'notes'>>) => {
    try {
      const { data, error } = await supabase
        .from('client_products_interest')
        .update(updates)
        .eq('id', interestId)
        .select(`
          *,
          product:products(id, name, price, category, description)
        `)
        .single();

      if (error) throw error;
      
      setInterests(prev => prev.map(item => item.id === interestId ? data : item));
      toast({
        title: "Sucesso",
        description: "Interesse atualizado",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating interest:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar interesse",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeInterest = async (interestId: string) => {
    try {
      const { error } = await supabase
        .from('client_products_interest')
        .delete()
        .eq('id', interestId);

      if (error) throw error;
      
      setInterests(prev => prev.filter(item => item.id !== interestId));
      toast({
        title: "Sucesso",
        description: "Produto removido dos interesses",
      });
    } catch (error) {
      console.error('Error removing interest:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover interesse",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addPurchase = async (purchaseData: {
    product_id: string;
    purchase_date?: string;
    purchase_value?: number;
    quantity?: number;
    status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
    payment_method?: string;
    notes?: string;
  }) => {
    if (!clientId) return;

    try {
      const { data, error } = await supabase
        .from('client_product_purchases')
        .insert({
          client_id: clientId,
          ...purchaseData,
        })
        .select(`
          *,
          product:products(id, name, price, category, description)
        `)
        .single();

      if (error) throw error;
      
      setPurchases(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Compra registrada",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding purchase:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar compra",
        variant: "destructive",
      });
      throw error;
    }
  };

  const convertInterestToPurchase = async (interestId: string, purchaseData?: {
    purchase_value?: number;
    quantity?: number;
    payment_method?: string;
    notes?: string;
  }) => {
    try {
      const interest = interests.find(i => i.id === interestId);
      if (!interest) throw new Error('Interest not found');

      // Add purchase
      const purchase = await addPurchase({
        product_id: interest.product_id,
        purchase_value: purchaseData?.purchase_value || interest.product?.price,
        quantity: purchaseData?.quantity || 1,
        payment_method: purchaseData?.payment_method,
        notes: purchaseData?.notes,
        status: 'completed',
      });

      // Remove interest
      await removeInterest(interestId);

      return purchase;
    } catch (error) {
      console.error('Error converting interest to purchase:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchInterests();
      fetchPurchases();
    }
  }, [clientId]);

  return {
    interests,
    purchases,
    loading,
    addInterest,
    updateInterest,
    removeInterest,
    addPurchase,
    convertInterestToPurchase,
    refetch: () => {
      fetchInterests();
      fetchPurchases();
    },
  };
};