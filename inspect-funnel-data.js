// Script para inspecionar a estrutura da tabela funnel_data
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para gerar UUID
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Função para verificar a estrutura da tabela funnel_data
async function inspectFunnelData() {
  console.log('=== INSPECIONANDO TABELA FUNNEL_DATA ===');
  
  try {
    // 1. Verificar se a tabela existe
    console.log('Verificando se a tabela funnel_data existe...');
    const { data: existingData, error: existingError } = await supabase
      .from('funnel_data')
      .select('*')
      .limit(1);
    
    if (existingError && existingError.message.includes('does not exist')) {
      console.log('A tabela funnel_data não existe.');
      return;
    }
    
    console.log('A tabela funnel_data existe.');
    
    // 2. Tentar obter registros existentes para inferir a estrutura
    console.log('\nBuscando registros existentes para inferir estrutura...');
    const { data: records, error: recordsError } = await supabase
      .from('funnel_data')
      .select('*')
      .limit(5);
    
    if (recordsError) {
      console.error('Erro ao buscar registros:', recordsError.message);
    } else if (records && records.length > 0) {
      console.log(`Encontrados ${records.length} registros.`);
      console.log('Estrutura inferida dos registros existentes:');
      console.log(JSON.stringify(records[0], null, 2));
    } else {
      console.log('Nenhum registro encontrado para inferir estrutura.');
    }
    
    // 3. Tentar inserir registros com diferentes estruturas para identificar os campos válidos
    console.log('\nTestando diferentes estruturas de campos...');
    
    // Estrutura 1: com leads e prospects
    const testRecord1 = {
      id: uuidv4(),
      stage: 'test',
      leads: 1,
      prospects: 1,
      created_at: new Date().toISOString()
    };
    
    console.log('Testando estrutura 1:', JSON.stringify(testRecord1, null, 2));
    const { error: error1 } = await supabase.from('funnel_data').insert(testRecord1);
    
    if (error1) {
      console.log('Erro na estrutura 1:', error1.message);
    } else {
      console.log('Estrutura 1 válida!');
      // Limpar o registro de teste
      await supabase.from('funnel_data').delete().eq('id', testRecord1.id);
    }
    
    // Estrutura 2: com leads_count e prospects_count
    const testRecord2 = {
      id: uuidv4(),
      stage: 'test',
      leads_count: 1,
      prospects_count: 1,
      created_at: new Date().toISOString()
    };
    
    console.log('\nTestando estrutura 2:', JSON.stringify(testRecord2, null, 2));
    const { error: error2 } = await supabase.from('funnel_data').insert(testRecord2);
    
    if (error2) {
      console.log('Erro na estrutura 2:', error2.message);
    } else {
      console.log('Estrutura 2 válida!');
      // Limpar o registro de teste
      await supabase.from('funnel_data').delete().eq('id', testRecord2.id);
    }
    
    // Estrutura 3: com count_leads e count_prospects
    const testRecord3 = {
      id: uuidv4(),
      stage: 'test',
      count_leads: 1,
      count_prospects: 1,
      created_at: new Date().toISOString()
    };
    
    console.log('\nTestando estrutura 3:', JSON.stringify(testRecord3, null, 2));
    const { error: error3 } = await supabase.from('funnel_data').insert(testRecord3);
    
    if (error3) {
      console.log('Erro na estrutura 3:', error3.message);
    } else {
      console.log('Estrutura 3 válida!');
      // Limpar o registro de teste
      await supabase.from('funnel_data').delete().eq('id', testRecord3.id);
    }
    
    // Estrutura 4: com lead_count e prospect_count (singular)
    const testRecord4 = {
      id: uuidv4(),
      stage: 'test',
      lead_count: 1,
      prospect_count: 1,
      created_at: new Date().toISOString()
    };
    
    console.log('\nTestando estrutura 4:', JSON.stringify(testRecord4, null, 2));
    const { error: error4 } = await supabase.from('funnel_data').insert(testRecord4);
    
    if (error4) {
      console.log('Erro na estrutura 4:', error4.message);
    } else {
      console.log('Estrutura 4 válida!');
      // Limpar o registro de teste
      await supabase.from('funnel_data').delete().eq('id', testRecord4.id);
    }
    
    // Estrutura 5: com total_leads e total_prospects
    const testRecord5 = {
      id: uuidv4(),
      stage: 'test',
      total_leads: 1,
      total_prospects: 1,
      created_at: new Date().toISOString()
    };
    
    console.log('\nTestando estrutura 5:', JSON.stringify(testRecord5, null, 2));
    const { error: error5 } = await supabase.from('funnel_data').insert(testRecord5);
    
    if (error5) {
      console.log('Erro na estrutura 5:', error5.message);
    } else {
      console.log('Estrutura 5 válida!');
      // Limpar o registro de teste
      await supabase.from('funnel_data').delete().eq('id', testRecord5.id);
    }
    
    // 4. Tentar obter informações sobre a estrutura da tabela através de erros
    console.log('\nTentando obter informações sobre a estrutura através de erros...');
    
    // Inserir um registro com campos extras para ver quais são rejeitados
    const testRecordAll = {
      id: uuidv4(),
      stage: 'test',
      leads: 1,
      prospects: 1,
      leads_count: 1,
      prospects_count: 1,
      count_leads: 1,
      count_prospects: 1,
      lead_count: 1,
      prospect_count: 1,
      total_leads: 1,
      total_prospects: 1,
      created_at: new Date().toISOString()
    };
    
    const { error: errorAll } = await supabase.from('funnel_data').insert(testRecordAll);
    
    if (errorAll) {
      console.log('Erro ao inserir registro com todos os campos:', errorAll.message);
      
      // Tentar extrair o nome do campo inválido da mensagem de erro
      const invalidField = errorAll.message.match(/column "([^"]+)" of relation/)?.[1];
      
      if (invalidField) {
        console.log(`Campo inválido detectado: ${invalidField}`);
        console.log('Isso sugere que os outros campos podem ser válidos.');
      }
    } else {
      console.log('Registro com todos os campos inserido com sucesso!');
      console.log('Isso sugere que todos os campos testados são válidos (ou são ignorados silenciosamente).');
      // Limpar o registro de teste
      await supabase.from('funnel_data').delete().eq('id', testRecordAll.id);
    }
    
    console.log('\n=== INSPEÇÃO CONCLUÍDA ===');
    
  } catch (err) {
    console.error('Erro durante a inspeção:', err.message);
  }
}

// Executar a inspeção
inspectFunnelData().catch(err => {
  console.error('Erro ao executar inspeção:', err);
});