import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SecureUser {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  is_active: boolean;
  login_attempts: number;
  locked_until: string | null;
  password_changed_at: string;
}

export interface UserFormData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'user';
}

export function useSecureUsers() {
  const [users, setUsers] = useState<SecureUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map data to match SecureUser interface
      const mappedUsers: SecureUser[] = (data || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role as 'admin' | 'user',
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login_at: user.last_login_at,
        is_active: user.is_active,
        login_attempts: user.login_attempts || 0,
        locked_until: user.locked_until || null,
        password_changed_at: user.password_changed_at || user.created_at
      }));

      setUsers(mappedUsers);
      
      // Log access
      await supabase.rpc('log_security_event', {
        _action: 'view_users',
        _resource: 'user_management',
        _success: true
      });

    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
      });
      setUsers([]);
      
      // Log error
      await supabase.rpc('log_security_event', {
        _action: 'view_users',
        _resource: 'user_management',
        _success: false,
        _error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addUser = useCallback(async (userData: UserFormData) => {
    try {
      // Validate password strength
      const { data: isValid, error: validationError } = await supabase.rpc('validate_password', {
        password: userData.password
      });

      if (validationError) throw validationError;

      if (!isValid) {
        toast({
          title: "Senha não atende aos critérios",
          description: "A senha deve ter pelo menos 12 caracteres, incluindo maiúscula, minúscula, número e caractere especial.",
        });
        return false;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update role if not default
        if (userData.role === 'admin') {
          await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: 'admin'
            });

          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', authData.user.id);
        }

        toast({
          title: "Usuário criado com sucesso",
          description: "O usuário recebeu um email de confirmação.",
        });

        // Log success
        await supabase.rpc('log_security_event', {
          _action: 'create_user',
          _resource: 'user_management',
          _success: true,
          _metadata: { created_user_email: userData.email }
        });

        // Refresh list
        await fetchUsers();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Não foi possível criar o usuário.",
      });

      // Log error
      await supabase.rpc('log_security_event', {
        _action: 'create_user',
        _resource: 'user_management',
        _success: false,
        _error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      return false;
    }
  }, [toast, fetchUsers]);

  const updateUser = useCallback(async (userId: string, userData: Partial<UserFormData>) => {
    try {
      const updates: any = {};
      
      if (userData.full_name !== undefined) {
        updates.full_name = userData.full_name;
      }

      if (userData.role !== undefined) {
        updates.role = userData.role;
        
        // Update role in user_roles table
        await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: userData.role
          });
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId);

        if (error) throw error;
      }

      toast({
        title: "Usuário atualizado",
        description: "Informações atualizadas com sucesso.",
      });

      // Log success
      await supabase.rpc('log_security_event', {
        _action: 'update_user',
        _resource: 'user_management',
        _success: true,
        _metadata: { updated_user_id: userId }
      });

      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o usuário.",
      });

      // Log error
      await supabase.rpc('log_security_event', {
        _action: 'update_user',
        _resource: 'user_management',
        _success: false,
        _error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      return false;
    }
  }, [toast, fetchUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      // Soft delete by deactivating the user
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Usuário desativado",
        description: "Usuário foi desativado com sucesso.",
      });

      // Log success
      await supabase.rpc('log_security_event', {
        _action: 'deactivate_user',
        _resource: 'user_management',
        _success: true,
        _metadata: { deactivated_user_id: userId }
      });

      await fetchUsers();
      return true;
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast({
        title: "Erro ao desativar usuário",
        description: error instanceof Error ? error.message : "Não foi possível desativar o usuário.",
      });

      // Log error
      await supabase.rpc('log_security_event', {
        _action: 'deactivate_user',
        _resource: 'user_management',
        _success: false,
        _error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      return false;
    }
  }, [toast, fetchUsers]);

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