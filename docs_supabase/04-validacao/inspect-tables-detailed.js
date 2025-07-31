// Script para inspecionar detalhadamente a estrutura das tabelas do Supabase
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Lista de tabelas para inspecionar
const tablesToInspect = [
  'client_stats',
  'conversation_metrics',
  'funnel_data',
  'utm_metrics',
  'ai_products',
  'contacts',
  'custom_fields',
  'custom_field_validation_rules',
  'client_custom_values',
  'custom_field_audit_log',
  'utm_tracking'
];

// Função para gerar UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

// Função para obter a estrutura de uma tabela
async function getTableStructure(tableName) {
  console.log(`\n=== INSPECIONANDO TABELA: ${tableName} ===`);
  
  try {
    // Verificar se a tabela existe
    const exists = await tableExists(tableName);
    
    if (!exists) {
      console.log(`Tabela ${tableName} não existe.`);
      return;
    }
    
    // Tentar obter registros existentes para inferir a estrutura
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);
    
    if (error) {
      console.error(`Erro ao obter registros da tabela ${tableName}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`Registros encontrados: ${data.length}`);
      console.log('Estrutura baseada em registros existentes:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('Nenhum registro encontrado para inferir a estrutura.');
      
      // Tentar inserir um registro de teste para descobrir a estrutura
      console.log('Tentando inserir um registro de teste...');
      
      // Criar um objeto com campos comuns
      const testId = uuidv4();
      const testRecord = {
        id: testId,
        created_at: new Date().toISOString()
      };
      
      // Adicionar campos específicos com base no nome da tabela
      if (tableName === 'client_stats') {
        Object.assign(testRecord, {
          total_clients: 1,
          total_chats: 1,
          new_clients_this_month: 1
          // Removido updated_at para testar se é realmente necessário
        });
      } else if (tableName === 'conversation_metrics') {
        Object.assign(testRecord, {
          total_conversations: 1,
          response_rate: 1,
          conversion_rate: 1
          // Removido updated_at para testar se é realmente necessário
        });
      } else if (tableName === 'funnel_data') {
        Object.assign(testRecord, {
          stage: 'test',
          // Testar diferentes campos para ver quais são válidos
          leads_count: 1,
          prospects_count: 1
          // Removido updated_at para testar se é realmente necessário
        });
      } else if (tableName === 'utm_metrics') {
        Object.assign(testRecord, {
          total_campaigns: 1,
          total_leads: 1,
          conversion_rate: 1,
          is_stale: false
        });
      } else if (tableName === 'ai_products') {
        Object.assign(testRecord, {
          name: 'Test Product'
        });
      } else if (tableName === 'contacts') {
        Object.assign(testRecord, {
          name: 'Test Contact',
          email: 'test@example.com',
          phone: '+5511999999999',
          company: 'Test Company',
          client_sector: 'Test Sector',
          kanban_stage: 'lead',
          status: 'active',
          source: 'test',
          responsible_user: 'Test User',
          last_contact: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else if (tableName === 'custom_fields') {
        Object.assign(testRecord, {
          field_name: 'Test Field',
          field_type: 'text',
          field_options: null,
          is_required: false,
          display_order: 1,
          updated_at: new Date().toISOString()
        });
      } else if (tableName === 'custom_field_validation_rules') {
        // Precisamos de um field_id válido
        const { data: fields } = await supabase.from('custom_fields').select('id').limit(1);
        const fieldId = fields && fields.length > 0 ? fields[0].id : uuidv4();
        
        Object.assign(testRecord, {
          field_id: fieldId,
          rule_type: 'required',
          rule_value: 'true',
          error_message: 'Test error message',
          updated_at: new Date().toISOString()
        });
      } else if (tableName === 'client_custom_values') {
        // Precisamos de um client_id e field_id válidos
        const { data: contacts } = await supabase.from('contacts').select('id').limit(1);
        const { data: fields } = await supabase.from('custom_fields').select('id').limit(1);
        
        const clientId = contacts && contacts.length > 0 ? contacts[0].id : uuidv4();
        const fieldId = fields && fields.length > 0 ? fields[0].id : uuidv4();
        
        Object.assign(testRecord, {
          client_id: clientId,
          field_id: fieldId,
          field_value: 'Test value',
          updated_at: new Date().toISOString()
        });
      } else if (tableName === 'custom_field_audit_log') {
        // Precisamos de um client_id e field_id válidos
        const { data: contacts } = await supabase.from('contacts').select('id').limit(1);
        const { data: fields } = await supabase.from('custom_fields').select('id').limit(1);
        
        const clientId = contacts && contacts.length > 0 ? contacts[0].id : uuidv4();
        const fieldId = fields && fields.length > 0 ? fields[0].id : uuidv4();
        
        Object.assign(testRecord, {
          client_id: clientId,
          field_id: fieldId,
          change_type: 'create',
          old_value: null,
          new_value: 'Test value',
          changed_by: 'Test User'
        });
      } else if (tableName === 'utm_tracking') {
        // Precisamos de um lead_id válido
        const { data: contacts } = await supabase.from('contacts').select('id').limit(1);
        const leadId = contacts && contacts.length > 0 ? contacts[0].id : uuidv4();
        
        Object.assign(testRecord, {
          lead_id: leadId,
          utm_source: 'test',
          utm_medium: 'test',
          utm_campaign: 'test',
          utm_term: 'test',
          utm_content: 'test',
          landing_page: 'https://example.com',
          referrer: 'test'
        });
      }
      
      // Tentar inserir o registro de teste
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(testRecord);
      
      if (insertError) {
        console.log('Erro ao inserir registro de teste:');
        console.log(insertError.message);
        
        // Analisar a mensagem de erro para inferir a estrutura
        if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
          console.log('\nColunas inválidas detectadas na mensagem de erro.');
        } else if (insertError.message.includes('violates not-null constraint')) {
          console.log('\nColunas obrigatórias detectadas na mensagem de erro.');
          
          // Extrair o nome da coluna obrigatória da mensagem de erro
          const match = insertError.message.match(/column "([^"]+)" of relation/);
          if (match && match[1]) {
            console.log(`Coluna obrigatória: ${match[1]}`);
          }
        }
      } else {
        console.log('Registro de teste inserido com sucesso!');
        
        // Obter o registro inserido
        const { data: insertedData } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', testId)
          .limit(1);
        
        if (insertedData && insertedData.length > 0) {
          console.log('Estrutura baseada no registro de teste:');
          console.log(JSON.stringify(insertedData[0], null, 2));
        }
        
        // Excluir o registro de teste
        await supabase
          .from(tableName)
          .delete()
          .eq('id', testId);
        
        console.log('Registro de teste excluído.');
      }
    }
    
  } catch (err) {
    console.error(`Erro ao inspecionar tabela ${tableName}:`, err.message);
  }
}

// Função principal para inspecionar todas as tabelas
async function inspectAllTables() {
  console.log('=== INICIANDO INSPEÇÃO DETALHADA DAS TABELAS DO SUPABASE ===');
  console.log('URL:', supabaseUrl);
  
  for (const table of tablesToInspect) {
    await getTableStructure(table);
  }
  
  console.log('\n=== INSPEÇÃO CONCLUÍDA ===');
}

// Executar a inspeção
inspectAllTables().catch(err => {
  console.error('Erro durante a inspeção das tabelas:', err);
});