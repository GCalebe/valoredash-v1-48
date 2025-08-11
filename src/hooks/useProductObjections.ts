// @ts-nocheck
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Objection {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  createdBy: string;
}

export function useProductObjections(productId: string, initialObjections: Objection[] = []) {
  const { user } = useAuth();
  const [objections, setObjections] = useState<Objection[]>(initialObjections || []);
  const [isLoading, setIsLoading] = useState(false);

  const loadObjections = useCallback(async () => {
    if (!user || !productId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_objections')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const formatted: Objection[] = (data || []).map((obj: any) => ({
        id: obj.id,
        question: obj.question,
        answer: obj.answer,
        createdAt: new Date(obj.created_at).toLocaleDateString(),
        createdBy: obj.created_by || 'Usuário',
      }));
      setObjections(formatted);
    } catch (err) {
      toast({ title: 'Erro', description: 'Não foi possível carregar as objeções.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [productId, user?.id]);

  useEffect(() => {
    if (productId && user) {
      loadObjections();
    } else if (!productId && initialObjections?.length > 0) {
      setObjections(initialObjections);
    }
  }, [productId, user, loadObjections]);

  const addObjection = useCallback(async (question: string, answer: string) => {
    if (!question.trim() || !answer.trim()) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha objeção e resposta.', variant: 'destructive' });
      return false;
    }
    if (!productId || !user) {
      const local: Objection = { id: `temp-${Date.now()}`, question: question.trim(), answer: answer.trim(), createdAt: new Date().toLocaleDateString(), createdBy: 'Usuário' };
      setObjections((prev) => [local, ...prev]);
      return true;
    }
    const { data, error } = await supabase
      .from('product_objections')
      .insert({ product_id: productId, user_id: user.id, question: question.trim(), answer: answer.trim(), created_by: user.id })
      .select()
      .single();
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível adicionar a objeção.', variant: 'destructive' });
      return false;
    }
    const created: Objection = { id: data.id, question: data.question, answer: data.answer, createdAt: new Date(data.created_at).toLocaleDateString(), createdBy: 'Usuário' };
    setObjections((prev) => [created, ...prev]);
    return true;
  }, [productId, user?.id]);

  const updateObjection = useCallback(async (objection: Objection, question: string, answer: string) => {
    if (!objection || !question.trim() || !answer.trim()) return false;
    if (objection.id.startsWith('temp-')) {
      setObjections((prev) => prev.map((o) => (o.id === objection.id ? { ...o, question: question.trim(), answer: answer.trim() } : o)));
      return true;
    }
    const { error } = await supabase
      .from('product_objections')
      .update({ question: question.trim(), answer: answer.trim(), updated_by: user?.id })
      .eq('id', objection.id)
      .eq('user_id', user?.id);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar a objeção.', variant: 'destructive' });
      return false;
    }
    setObjections((prev) => prev.map((o) => (o.id === objection.id ? { ...o, question: question.trim(), answer: answer.trim() } : o)));
    return true;
  }, [user?.id]);

  const deleteObjection = useCallback(async (objectionId: string) => {
    if (objectionId.startsWith('temp-')) {
      setObjections((prev) => prev.filter((o) => o.id !== objectionId));
      return true;
    }
    const { error } = await supabase.from('product_objections').delete().eq('id', objectionId).eq('user_id', user?.id);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível remover a objeção.', variant: 'destructive' });
      return false;
    }
    setObjections((prev) => prev.filter((o) => o.id !== objectionId));
    return true;
  }, [user?.id]);

  return { objections, isLoading, loadObjections, addObjection, updateObjection, deleteObjection };
}


