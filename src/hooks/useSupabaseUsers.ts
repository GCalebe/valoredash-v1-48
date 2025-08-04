import { useState, useEffect, useCallback } from 'react';
import { User, UserFormData } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  department: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  ai_access: string[];
}

export function useSupabaseUsers() {
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch users from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Fetch AI access for each user
      const usersWithAIAccess = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: aiAccess, error: aiError } = await supabase
            .from('user_ai_access')
            .select('ai_product_id')
            .eq('user_id', profile.id)
            .eq('is_active', true);

          if (aiError) {
            console.error('Error fetching AI access for user:', profile.id, aiError);
          }

          return {
            ...profile,
            ai_access: aiAccess?.map(access => access.ai_product_id) || []
          };
        })
      );

      setUsers(usersWithAIAccess);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addUser = useCallback(async (userData: UserFormData) => {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          is_active: true
        });

      if (profileError) {
        throw profileError;
      }

      // Add AI access permissions
      if (userData.ai_access && userData.ai_access.length > 0) {
        const aiAccessData = userData.ai_access.map(aiId => ({
          user_id: authData.user.id,
          ai_product_id: aiId,
          granted_by: null // Will be set by RLS policy
        }));

        const { error: aiAccessError } = await supabase
          .from('user_ai_access')
          .insert(aiAccessData);

        if (aiAccessError) {
          console.error('Error adding AI access:', aiAccessError);
          // Don't throw here, user was created successfully
        }
      }

      await fetchUsers(); // Refresh the list
      
      toast({
        title: "Usuário adicionado",
        description: "Usuário criado com sucesso!",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Erro ao adicionar usuário",
        description: error.message || "Não foi possível criar o usuário.",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchUsers, toast]);

  const updateUser = useCallback(async (userId: string, userData: Partial<UserFormData>) => {
    try {
      // Update profile
      const updateData: any = {};
      if (userData.full_name !== undefined) updateData.full_name = userData.full_name;
      if (userData.role !== undefined) updateData.role = userData.role;
      updateData.updated_at = new Date().toISOString();

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      // Update AI access if provided
      if (userData.ai_access !== undefined) {
        // First, deactivate all current access
        await supabase
          .from('user_ai_access')
          .update({ is_active: false })
          .eq('user_id', userId);

        // Then add new access permissions
        if (userData.ai_access.length > 0) {
          const aiAccessData = userData.ai_access.map(aiId => ({
            user_id: userId,
            ai_product_id: aiId,
            granted_by: null, // Will be set by RLS policy
            is_active: true
          }));

          // Use upsert to handle existing records
          const { error: aiAccessError } = await supabase
            .from('user_ai_access')
            .upsert(aiAccessData, {
              onConflict: 'user_id,ai_product_id'
            });

          if (aiAccessError) {
            console.error('Error updating AI access:', aiAccessError);
          }
        }
      }

      await fetchUsers(); // Refresh the list
      
      toast({
        title: "Usuário atualizado",
        description: "Informações do usuário atualizadas com sucesso!",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchUsers, toast]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      // Soft delete - just deactivate the user
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      // Deactivate AI access
      await supabase
        .from('user_ai_access')
        .update({ is_active: false })
        .eq('user_id', userId);

      await fetchUsers(); // Refresh the list
      
      toast({
        title: "Usuário desativado",
        description: "Usuário foi desativado com sucesso!",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Erro ao desativar usuário",
        description: error.message || "Não foi possível desativar o usuário.",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchUsers, toast]);

  // Initialize users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser
  };
}