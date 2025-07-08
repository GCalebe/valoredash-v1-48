import { useState, useEffect, useCallback } from 'react';
import { User, UserFormData } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { useAIProductsQuery } from '@/hooks/useAIProductsQuery';

// Sample mock users with AI access
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
    created_at: '2025-01-01T00:00:00Z',
    last_sign_in_at: '2025-06-30T10:00:00Z',
    ai_access: ['ai-sdr', 'ai-atendente', 'ai-meta', 'ai-aurora', 'ai-gestor-trafego']
  },
  {
    id: 'user-2',
    email: 'marketing@example.com',
    full_name: 'Marketing Manager',
    role: 'user',
    created_at: '2025-01-15T00:00:00Z',
    last_sign_in_at: '2025-06-29T14:30:00Z',
    ai_access: ['ai-meta', 'ai-gestor-trafego', 'ai-post']
  },
  {
    id: 'user-3',
    email: 'sales@example.com',
    full_name: 'Sales Representative',
    role: 'user',
    created_at: '2025-02-01T00:00:00Z',
    last_sign_in_at: '2025-06-28T09:15:00Z',
    ai_access: ['ai-sdr', 'ai-atendente', 'ai-onboarding']
  },
  {
    id: 'user-4',
    email: 'content@example.com',
    full_name: 'Content Creator',
    role: 'user',
    created_at: '2025-02-15T00:00:00Z',
    last_sign_in_at: '2025-06-27T16:45:00Z',
    ai_access: ['ai-wordpress', 'ai-video', 'ai-foto']
  },
  {
    id: 'user-5',
    email: 'finance@example.com',
    full_name: 'Finance Manager',
    role: 'user',
    created_at: '2025-03-01T00:00:00Z',
    last_sign_in_at: '2025-06-26T11:20:00Z',
    ai_access: ['ai-financeiro', 'ai-relatorio', 'ai-binance']
  }
];

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { data: supabaseAIProducts = [] } = useAIProductsQuery();
  
  // Use Supabase AI products if available
  const availableAIProducts = supabaseAIProducts || [];

  // Store users in localStorage to persist between page refreshes
  const saveUsersToLocalStorage = (users: User[]) => {
    try {
      localStorage.setItem('mockUsers', JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users to localStorage:", error);
    }
  };

  // Load users from localStorage
  const loadUsersFromLocalStorage = (): User[] | null => {
    try {
      const storedUsers = localStorage.getItem('mockUsers');
      if (storedUsers) {
        return JSON.parse(storedUsers);
      }
    } catch (error) {
      console.error("Error loading users from localStorage:", error);
    }
    return null;
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // First try to load from localStorage
      const storedUsers = loadUsersFromLocalStorage();
      if (storedUsers && storedUsers.length > 0) {
        console.log("Loaded users from localStorage:", storedUsers.length);
        setUsers(storedUsers);
        setLoading(false);
        return;
      }
      
      // If no stored users, use mock data
      console.log("Using mock user data...");
      
      // Save to localStorage for future use
      saveUsersToLocalStorage(mockUsers);
      setUsers(mockUsers);
      
    } catch (error) {
      console.error("Error fetching users:", error);
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
      // Create a new user with the provided data
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        created_at: new Date().toISOString(),
        last_sign_in_at: null,
        ai_access: userData.ai_access || []
      };
      
      // Add the new user to the list
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveUsersToLocalStorage(updatedUsers);
      
      toast({
        title: "Usuário adicionado",
        description: "Usuário criado com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Erro ao adicionar usuário",
        description: "Não foi possível criar o usuário.",
        variant: "destructive",
      });
      return false;
    }
  }, [users, toast]);

  const updateUser = useCallback(async (userId: string, userData: Partial<UserFormData>) => {
    try {
      // Find the user to update
      const userToUpdate = users.find(user => user.id === userId);
      if (!userToUpdate) {
        throw new Error("Usuário não encontrado");
      }
      
      // Update the user data
      const updatedUser: User = {
        ...userToUpdate,
        full_name: userData.full_name !== undefined ? userData.full_name : userToUpdate.full_name,
        role: userData.role !== undefined ? userData.role : userToUpdate.role,
        ai_access: userData.ai_access !== undefined ? userData.ai_access : userToUpdate.ai_access
      };
      
      // Update the users list
      const updatedUsers = users.map(user => 
        user.id === userId ? updatedUser : user
      );
      
      setUsers(updatedUsers);
      saveUsersToLocalStorage(updatedUsers);
      
      toast({
        title: "Usuário atualizado",
        description: "Informações do usuário atualizadas com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Erro ao atualizar usuário",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
      return false;
    }
  }, [users, toast]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      // Remove the user from the list
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      saveUsersToLocalStorage(updatedUsers);
      
      toast({
        title: "Usuário excluído",
        description: "Usuário removido com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
      return false;
    }
  }, [users, toast]);

  // Initialize users on component mount (AI products are loaded automatically)
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