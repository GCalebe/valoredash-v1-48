// Script para verificar a saúde do banco de dados Supabase
// Executa consultas para verificar tabelas vazias e integridade dos dados

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Lista de tabelas a serem verificadas
const tables = [
  'contacts',
  'client_stats',
  'monthly_growth',
  'conversation_metrics',
  'conversation_daily_data',
  'funnel_data',
  'conversion_by_time',
  'leads_by_source',
  'leads_over_time',
  'utm_metrics',
  'campaign_data',
  'utm_tracking',
  'ai_products',
  'custom_fields',
  'client_custom_values',
  'custom_field_validation_rules',
  'custom_field_audit_log'
];

// Função para verificar se uma tabela está vazia
async function checkTableEmpty(tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      return { table: tableName, exists: false, error: error.message };
    }
    
    return { table: tableName, exists: true, isEmpty: count === 0, count };
  } catch (err) {
    return { table: tableName, exists: false, error: err.message };
  }
}

// Função para verificar a integridade dos relacionamentos
async function checkRelationships() {
  // Verificar relacionamentos entre contacts e client_custom_values
  const { data: customValues, error: customValuesError } = await supabase
    .from('client_custom_values')
    .select('client_id');
  
  if (customValuesError) {
    console.error('Erro ao verificar client_custom_values:', customValuesError.message);
    return;
  }
  
  const clientIds = customValues?.map(cv => cv.client_id) || [];
  const uniqueClientIds = [...new Set(clientIds)];
  
  if (uniqueClientIds.length > 0) {
    const { data: validClients, error: clientsError } = await supabase
      .from('contacts')
      .select('id')
      .in('id', uniqueClientIds);
    
    if (clientsError) {
      console.error('Erro ao verificar contacts:', clientsError.message);
      return;
    }
    
    const validClientIds = validClients?.map(c => c.id) || [];
    const orphanedValues = uniqueClientIds.filter(id => !validClientIds.includes(id));
    
    console.log('\nVerificação de Integridade Referencial:');
    console.log(`- Total de client_custom_values: ${customValues?.length || 0}`);
    console.log(`- Clientes únicos referenciados: ${uniqueClientIds.length}`);
    console.log(`- Clientes válidos encontrados: ${validClientIds.length}`);
    console.log(`- Valores órfãos (sem cliente): ${orphanedValues.length}`);
    
    if (orphanedValues.length > 0) {
      console.log('  IDs de clientes órfãos:', orphanedValues.slice(0, 5), orphanedValues.length > 5 ? `... e mais ${orphanedValues.length - 5}` : '');
    }
  }
}

// Função principal
async function checkDatabaseHealth() {
  console.log('=== VERIFICAÇÃO DE SAÚDE DO BANCO DE DADOS SUPABASE ===');
  console.log('URL:', supabaseUrl);
  console.log('\nVerificando tabelas...');
  
  const results = [];
  
  // Verificar cada tabela
  for (const table of tables) {
    const result = await checkTableEmpty(table);
    results.push(result);
    
    const status = result.exists 
      ? (result.isEmpty ? '⚠️ VAZIA' : `✅ OK (${result.count} registros)`) 
      : '❌ NÃO EXISTE';
    
    console.log(`- ${table}: ${status}`);
    
    if (result.error) {
      console.log(`  Erro: ${result.error}`);
    }
  }
  
  // Verificar relacionamentos
  await checkRelationships();
  
  // Resumo
  const emptyTables = results.filter(r => r.exists && r.isEmpty).map(r => r.table);
  const nonExistentTables = results.filter(r => !r.exists).map(r => r.table);
  
  console.log('\n=== RESUMO ===');
  console.log(`Total de tabelas verificadas: ${tables.length}`);
  console.log(`Tabelas existentes: ${results.filter(r => r.exists).length}`);
  console.log(`Tabelas vazias: ${emptyTables.length}`);
  console.log(`Tabelas inexistentes: ${nonExistentTables.length}`);
  
  if (emptyTables.length > 0) {
    console.log('\nTabelas vazias que precisam ser preenchidas:');
    emptyTables.forEach(table => console.log(`- ${table}`));
  }
  
  if (nonExistentTables.length > 0) {
    console.log('\nTabelas que precisam ser criadas:');
    nonExistentTables.forEach(table => console.log(`- ${table}`));
  }
}

// Executar verificação
checkDatabaseHealth().catch(err => {
  console.error('Erro ao verificar saúde do banco de dados:', err);
});