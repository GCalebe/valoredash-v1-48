import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

// Carregar variáveis de ambiente do arquivo .env
try {
  const dotenv = await import('dotenv');
  const { existsSync } = await import('fs');
  if (existsSync('.env')) {
    dotenv.config();
    console.log('Variáveis de ambiente carregadas do arquivo .env');
  }
} catch (err) {
  console.log('Não foi possível carregar o arquivo .env:', err.message);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Lista de tabelas para verificar
const tablesToCheck = [
  'contacts',
  'utm_tracking',
  'custom_fields',
  'custom_field_validation_rules',
  'client_custom_values',
  'custom_field_audit_log',
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
  'ai_products'
];

// Função para verificar o número de registros em cada tabela
async function checkTableRecords() {
  console.log('=== VERIFICAÇÃO DE DADOS NO SUPABASE ===');
  console.log('Tabela | Registros | Status');
  console.log('---------------------------');
  
  let emptyTables = [];
  let nonEmptyTables = [];
  let errorTables = [];
  
  for (const table of tablesToCheck) {
    try {
      const { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' });
      
      if (error) {
        console.log(`${table} | ERRO | ${error.message}`);
        errorTables.push({ table, error: error.message });
        continue;
      }
      
      const recordCount = count || (data ? data.length : 0);
      const status = recordCount > 0 ? 'PREENCHIDA' : 'VAZIA';
      console.log(`${table} | ${recordCount} | ${status}`);
      
      if (recordCount === 0) {
        emptyTables.push(table);
      } else {
        nonEmptyTables.push({ table, count: recordCount });
      }
    } catch (err) {
      console.log(`${table} | ERRO | ${err.message}`);
      errorTables.push({ table, error: err.message });
    }
  }
  
  console.log('\n=== RESUMO ===');
  console.log(`Total de tabelas verificadas: ${tablesToCheck.length}`);
  console.log(`Tabelas preenchidas: ${nonEmptyTables.length}`);
  console.log(`Tabelas vazias: ${emptyTables.length}`);
  console.log(`Tabelas com erro: ${errorTables.length}`);
  
  if (emptyTables.length > 0) {
    console.log('\nTabelas vazias:');
    emptyTables.forEach(table => console.log(`- ${table}`));
  }
  
  if (errorTables.length > 0) {
    console.log('\nTabelas com erro:');
    errorTables.forEach(({ table, error }) => console.log(`- ${table}: ${error}`));
  }
  
  // Verificar integridade referencial
  console.log('\n=== VERIFICAÇÃO DE INTEGRIDADE REFERENCIAL ===');
  
  // Verificar se há valores personalizados para contatos existentes
  if (nonEmptyTables.find(t => t.table === 'contacts') && nonEmptyTables.find(t => t.table === 'client_custom_values')) {
    const { data: customValues, error: cvError } = await supabase
      .from('client_custom_values')
      .select('client_id');
    
    if (!cvError && customValues && customValues.length > 0) {
      const clientIds = [...new Set(customValues.map(cv => cv.client_id))];
      
      const { data: validClients, error: vcError } = await supabase
        .from('contacts')
        .select('id')
        .in('id', clientIds);
      
      if (!vcError) {
        const validClientIds = validClients.map(c => c.id);
        const invalidClientIds = clientIds.filter(id => !validClientIds.includes(id));
        
        console.log(`Valores personalizados: ${customValues.length} registros para ${clientIds.length} contatos`);
        console.log(`Contatos válidos: ${validClientIds.length}`);
        console.log(`Contatos inválidos: ${invalidClientIds.length}`);
      }
    }
  }
  
  // Verificar se há registros UTM para contatos existentes
  if (nonEmptyTables.find(t => t.table === 'contacts') && nonEmptyTables.find(t => t.table === 'utm_tracking')) {
    const { data: utmRecords, error: utmError } = await supabase
      .from('utm_tracking')
      .select('lead_id');
    
    if (!utmError && utmRecords && utmRecords.length > 0) {
      const leadIds = [...new Set(utmRecords.map(utm => utm.lead_id))];
      
      const { data: validLeads, error: vlError } = await supabase
        .from('contacts')
        .select('id')
        .in('id', leadIds);
      
      if (!vlError) {
        const validLeadIds = validLeads.map(c => c.id);
        const invalidLeadIds = leadIds.filter(id => !validLeadIds.includes(id));
        
        console.log(`Registros UTM: ${utmRecords.length} registros para ${leadIds.length} contatos`);
        console.log(`Contatos válidos: ${validLeadIds.length}`);
        console.log(`Contatos inválidos: ${invalidLeadIds.length}`);
      }
    }
  }
}

// Executar a verificação
checkTableRecords().catch(console.error);