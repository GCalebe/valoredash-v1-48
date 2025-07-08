// Script para inspecionar a estrutura das tabelas existentes no Supabase
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Lista de tabelas para inspecionar
const tablesToInspect = [
  'contacts',
  'utm_tracking',
  'custom_fields',
  'custom_field_validation_rules',
  'client_custom_values',
  'custom_field_audit_log',
  'client_stats',
  'conversation_metrics',
  'funnel_data',
  'utm_metrics',
  'ai_products'
];

// Função para verificar se uma tabela existe
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    return !error || !error.message.includes('does not exist');
  } catch (err) {
    return false;
  }
}

// Função para inspecionar a estrutura de uma tabela
async function inspectTable(tableName) {
  console.log(`\n=== INSPECIONANDO TABELA: ${tableName} ===`);
  
  try {
    // Verificar se a tabela existe
    const exists = await tableExists(tableName);
    
    if (!exists) {
      console.log(`Tabela ${tableName} não existe.`);
      return;
    }
    
    // Tentar inserir um registro com campos fictícios para ver quais são aceitos
    const testRecord = {
      id: 'test-id-' + Date.now(),
      // Campos comuns em várias tabelas
      name: 'Test Name',
      email: 'test@example.com',
      phone: '+5511999999999',
      company: 'Test Company',
      client_sector: 'Test Sector',
      kanban_stage: 'lead',
      status: 'active',
      source: 'test',
      responsible_user: 'Test User',
      last_contact: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: 'Test Notes',
      // Campos específicos para algumas tabelas
      field_name: 'Test Field',
      field_type: 'text',
      field_options: ['Option 1', 'Option 2'],
      is_required: false,
      display_order: 1,
      field_id: 'test-field-id',
      rule_type: 'required',
      rule_value: 'true',
      error_message: 'Test Error',
      client_id: 'test-client-id',
      field_value: 'Test Value',
      change_type: 'create',
      old_value: null,
      new_value: 'Test Value',
      changed_by: 'Test User',
      // Campos para tabelas de métricas
      total_clients: 5,
      total_chats: 10,
      new_clients_this_month: 5,
      active_clients: 5,
      inactive_clients: 0,
      average_response_time: 10,
      total_conversations: 10,
      response_rate: 80,
      conversion_rate: 30,
      stage: 'all',
      leads: 5,
      prospects: 3,
      customers: 2,
      source: 'google',
      count: 10,
      description: 'Test Description',
      price: 99.90
    };
    
    // Tentar inserir o registro
    const { error } = await supabase.from(tableName).insert(testRecord);
    
    if (error) {
      // Analisar a mensagem de erro para identificar campos inválidos
      console.log('Erro ao inserir registro de teste:', error.message);
      
      // Extrair informações sobre campos inválidos
      if (error.message.includes('column')) {
        const columnMatch = error.message.match(/column ["']([^"']+)["']/i);
        if (columnMatch && columnMatch[1]) {
          console.log(`Campo inválido detectado: ${columnMatch[1]}`);
        }
      }
      
      // Tentar identificar os campos válidos a partir da mensagem de erro
      console.log('Tentando identificar campos válidos...');
      
      // Abordagem alternativa: tentar inserir um registro vazio e ver o erro
      const { error: emptyError } = await supabase.from(tableName).insert({});
      if (emptyError) {
        console.log('Erro ao inserir registro vazio:', emptyError.message);
        
        // Tentar extrair os nomes dos campos obrigatórios
        if (emptyError.message.includes('violates not-null constraint')) {
          const nullMatch = emptyError.message.match(/column ["']([^"']+)["']/i);
          if (nullMatch && nullMatch[1]) {
            console.log(`Campo obrigatório detectado: ${nullMatch[1]}`);
          }
        }
      }
    } else {
      console.log('Registro de teste inserido com sucesso! Removendo...');
      // Remover o registro de teste
      await supabase.from(tableName).delete().eq('id', testRecord.id);
    }
    
    // Tentar obter um registro existente para ver os campos
    const { data, error: selectError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('Erro ao selecionar registro:', selectError.message);
    } else if (data && data.length > 0) {
      console.log('Estrutura detectada a partir de um registro existente:');
      const fields = Object.keys(data[0]);
      fields.forEach(field => {
        console.log(`- ${field}: ${typeof data[0][field]}`);
      });
    } else {
      console.log('Nenhum registro encontrado para analisar a estrutura.');
    }
    
  } catch (err) {
    console.error(`Erro ao inspecionar tabela ${tableName}:`, err.message);
  }
}

// Função principal para inspecionar todas as tabelas
async function inspectAllTables() {
  console.log('=== INSPEÇÃO DE TABELAS DO SUPABASE ===');
  console.log('URL:', supabaseUrl);
  
  for (const table of tablesToInspect) {
    await inspectTable(table);
  }
  
  console.log('\n=== INSPEÇÃO CONCLUÍDA ===');
}

// Executar a inspeção
inspectAllTables().catch(err => {
  console.error('Erro durante a inspeção das tabelas:', err);
});