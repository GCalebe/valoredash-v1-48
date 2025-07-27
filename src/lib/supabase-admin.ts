import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase/database';

// Configuração centralizada do Supabase com Service Role Key
// Esta configuração bypassa RLS e deve ser usada para operações administrativas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required');
}

if (!serviceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Some administrative operations may fail.');
}

// Cliente Supabase com Service Role Key (bypassa RLS)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  serviceRoleKey || import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Função utilitária para verificar se estamos usando service role
export const isUsingServiceRole = () => {
  return !!serviceRoleKey;
};

// Função para log de operações administrativas
export const logAdminOperation = (operation: string, table: string) => {
  const keyType = isUsingServiceRole() ? 'SERVICE_ROLE' : 'ANON';
  console.log(`[SUPABASE_ADMIN] ${operation} on ${table} using ${keyType} key`);
};

// Wrapper para operações CRUD que sempre usam service role
export const adminOperations = {
  // SELECT com service role
  select: <T = any>(table: string) => {
    logAdminOperation('SELECT', table);
    return supabaseAdmin.from(table).select();
  },

  // INSERT com service role
  insert: <T = any>(table: string, data: T | T[]) => {
    logAdminOperation('INSERT', table);
    return supabaseAdmin.from(table).insert(data);
  },

  // UPDATE com service role
  update: <T = any>(table: string, data: Partial<T>) => {
    logAdminOperation('UPDATE', table);
    return supabaseAdmin.from(table).update(data);
  },

  // UPSERT com service role
  upsert: <T = any>(table: string, data: T | T[]) => {
    logAdminOperation('UPSERT', table);
    return supabaseAdmin.from(table).upsert(data);
  },

  // DELETE com service role
  delete: (table: string) => {
    logAdminOperation('DELETE', table);
    return supabaseAdmin.from(table).delete();
  },

  // RPC com service role
  rpc: (functionName: string, params?: any) => {
    logAdminOperation('RPC', functionName);
    return supabaseAdmin.rpc(functionName, params);
  }
};

export default supabaseAdmin;