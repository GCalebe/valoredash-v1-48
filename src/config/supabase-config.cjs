// Configuração centralizada do Supabase para scripts Node.js
// Este arquivo garante que todas as operações CRUD usem a Service Role Key como padrão

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

/**
 * Configuração padrão do Supabase com Service Role Key
 * Esta configuração bypassa RLS e deve ser usada para operações administrativas
 */
function createSupabaseAdminClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('❌ VITE_SUPABASE_URL não encontrada no .env');
  }

  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env');
    console.error('⚠️  Esta chave é necessária para operações administrativas que bypassam RLS');
    console.error('💡 Usando ANON_KEY como fallback, mas operações podem falhar devido ao RLS');
    
    if (!anonKey) {
      throw new Error('❌ Nenhuma chave Supabase válida encontrada');
    }
  }

  const keyToUse = serviceRoleKey || anonKey;
  const keyType = serviceRoleKey ? 'SERVICE_ROLE' : 'ANON';
  
  console.log(`🔑 Usando chave ${keyType} para operações Supabase`);
  
  return createClient(supabaseUrl, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Wrapper para operações CRUD que sempre tentam usar service role
 */
function createAdminOperations(supabase) {
  const isUsingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const logOperation = (operation, table) => {
    const keyType = isUsingServiceRole ? 'SERVICE_ROLE' : 'ANON';
    console.log(`[SUPABASE_ADMIN] ${operation} on ${table} using ${keyType} key`);
  };

  return {
    // SELECT com service role
    select: (table) => {
      logOperation('SELECT', table);
      return supabase.from(table).select();
    },

    // INSERT com service role
    insert: (table, data) => {
      logOperation('INSERT', table);
      return supabase.from(table).insert(data);
    },

    // UPDATE com service role
    update: (table, data) => {
      logOperation('UPDATE', table);
      return supabase.from(table).update(data);
    },

    // UPSERT com service role
    upsert: (table, data) => {
      logOperation('UPSERT', table);
      return supabase.from(table).upsert(data);
    },

    // DELETE com service role
    delete: (table) => {
      logOperation('DELETE', table);
      return supabase.from(table).delete();
    },

    // RPC com service role
    rpc: (functionName, params) => {
      logOperation('RPC', functionName);
      return supabase.rpc(functionName, params);
    },

    // Cliente raw para operações customizadas
    client: supabase,
    
    // Verificar se está usando service role
    isUsingServiceRole: () => isUsingServiceRole
  };
}

module.exports = {
  createSupabaseAdminClient,
  createAdminOperations,
  
  // Função de conveniência que cria cliente e operações
  createSupabaseAdmin: () => {
    const client = createSupabaseAdminClient();
    return createAdminOperations(client);
  }
};