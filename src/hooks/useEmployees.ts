import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Employee {
  id: string;
  name: string;
  role: string;
  description?: string;
  available_hours?: string[];
  available_days?: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar funcionários:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os funcionários.",
        });
        return;
      }

      setEmployees(data || []);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os funcionários.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([{
          ...employee,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar funcionário:', error);
        throw error;
      }

      setEmployees(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Funcionário adicionado com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o funcionário.",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    fetchEmployees,
    addEmployee,
  };
}