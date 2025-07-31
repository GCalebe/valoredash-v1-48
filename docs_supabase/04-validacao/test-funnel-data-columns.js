// Script para testar diferentes combinações de colunas para a tabela funnel_data
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções utilitárias
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
    console.error(`Erro ao verificar se a tabela ${tableName} existe:`, err.message);
    return false;
  }
}

// Função principal para testar diferentes combinações de colunas para funnel_data
async function testFunnelDataColumns() {
  console.log('=== TESTANDO COMBINAÇÕES DE COLUNAS PARA FUNNEL_DATA ===');
  console.log('URL:', supabaseUrl);
  
  try {
    // Verificar se a tabela funnel_data existe
    if (await tableExists('funnel_data')) {
      console.log('Tabela funnel_data existe. Testando combinações de colunas...');
      
      // Tentar várias combinações de colunas para funnel_data
      const funnelDataCombinations = [
        // Combinação 1: leads e prospects
        {
          id: uuidv4(),
          stage: 'all',
          leads: 5,
          prospects: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 2: leads_count e prospects_count
        {
          id: uuidv4(),
          stage: 'all',
          leads_count: 5,
          prospects_count: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 3: count_leads e count_prospects
        {
          id: uuidv4(),
          stage: 'all',
          count_leads: 5,
          count_prospects: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 4: lead_count e prospect_count
        {
          id: uuidv4(),
          stage: 'all',
          lead_count: 5,
          prospect_count: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 5: total_leads e total_prospects
        {
          id: uuidv4(),
          stage: 'all',
          total_leads: 5,
          total_prospects: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 6: value e count
        {
          id: uuidv4(),
          stage: 'all',
          value: 5,
          count: 3,
          created_at: new Date().toISOString()
        },
        // Combinação 7: apenas campos obrigatórios
        {
          id: uuidv4(),
          stage: 'all',
          created_at: new Date().toISOString()
        }
      ];
      
      let funnelDataInserted = false;
      let combinationIndex = 1;
      
      // Tentar cada combinação até uma funcionar
      for (const funnelData of funnelDataCombinations) {
        console.log(`Testando combinação ${combinationIndex}:`, Object.keys(funnelData).filter(k => k !== 'id' && k !== 'created_at').join(', '));
        
        try {
          const { error } = await supabase.from('funnel_data').insert(funnelData);
          
          if (!error) {
            console.log(`✅ Combinação ${combinationIndex} funcionou! Colunas: ${Object.keys(funnelData).filter(k => k !== 'id' && k !== 'created_at').join(', ')}`);
            funnelDataInserted = true;
            break;
          } else {
            console.log(`❌ Combinação ${combinationIndex} falhou: ${error.message}`);
          }
        } catch (err) {
          console.log(`❌ Combinação ${combinationIndex} falhou: ${err.message}`);
        }
        
        combinationIndex++;
      }
      
      if (!funnelDataInserted) {
        console.error('Todas as combinações para funnel_data falharam.');
      }
    } else {
      console.log('Tabela funnel_data não existe.');
    }
    
    console.log('\n=== TESTE CONCLUÍDO ===');
  } catch (err) {
    console.error('Erro durante o teste:', err.message);
  }
}

// Executar o teste
testFunnelDataColumns().catch(err => {
  console.error('Erro ao executar o teste:', err.message);
});