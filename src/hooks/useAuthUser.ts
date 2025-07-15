import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

/**
 * Hook utilitário para obter usuário autenticado
 * Centraliza verificação de autenticação para outros hooks
 */
export const useAuthUser = () => {
  const getCurrentUser = async (): Promise<User> => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    return user;
  };

  return { getCurrentUser };
};

/**
 * Função utilitária para verificar se usuário está autenticado
 * Pode ser usada fora de componentes React
 */
export const getCurrentAuthUser = async (): Promise<User> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(`Authentication error: ${error.message}`);
  }
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  return user;
};