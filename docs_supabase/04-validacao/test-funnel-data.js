import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para gerar UUID
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

// Função para obter as colunas de uma tabela
async function getTableColumns(tableName) {
  try {
    // Tentar inserir um registro com um campo fictício para provocar um erro
    // que nos dirá quais campos são válidos
    const testRecord = {
      id: uuidv4(),
      _test_field_that_doesnt_exist: 'test',
      created_at: new Date().toISOString()
    };
    
    const { error } = await supabase.from(tableName).insert(testRecord);
    
    if (error && error.message.includes('column "_test_field_that_doesnt_exist" of relation')) {
      // Tentar extrair os campos válidos da mensagem de erro
      console.log('Erro ao inserir registro de teste:', error.message);
      return [];
    }
    
    return [];
  } catch (err) {
    console.error('Erro ao obter colunas da tabela:', err.message);
    return [];
  }
}

// Função para testar diferentes combinações de colunas
async function testFunnelDataColumns() {
  console.log('=== TESTANDO TABELA FUNNEL_DATA ===');
  
  if (!(await tableExists('funnel_data'))) {
    console.log('A tabela funnel_data não existe!');
    return;
  }
  
  console.log('A tabela funnel_data existe. Testando diferentes combinações de colunas...');
  
  // Tentar obter registros existentes
  const { data: existingRecords, error: fetchError } = await supabase
    .from('funnel_data')
    .select('*')
    .limit(5);
  
  if (fetchError) {
    console.error('Erro ao buscar registros existentes:', fetchError.message);
  } else if (existingRecords && existingRecords.length > 0) {
    console.log('Registros existentes encontrados:');
    console.log(JSON.stringify(existingRecords, null, 2));
    console.log('Colunas detectadas:', Object.keys(existingRecords[0]).join(', '));
    return;
  } else {
    console.log('Nenhum registro existente encontrado.');
  }
  
  // Lista de possíveis combinações de colunas para testar
  const columnCombinations = [
    // Combinação 1
    {
      id: uuidv4(),
      stage: 'test',
      leads: 1,
      prospects: 1,
      created_at: new Date().toISOString()
    },
    // Combinação 2
    {
      id: uuidv4(),
      stage: 'test',
      leads_count: 1,
      prospects_count: 1,
      created_at: new Date().toISOString()
    },
    // Combinação 3
    {
      id: uuidv4(),
      stage: 'test',
      count_leads: 1,
      count_prospects: 1,
      created_at: new Date().toISOString()
    },
    // Combinação 4
    {
      id: uuidv4(),
      stage: 'test',
      lead_count: 1,
      prospect_count: 1,
      created_at: new Date().toISOString()
    },
    // Combinação 5
    {
      id: uuidv4(),
      stage: 'test',
      total_leads: 1,
      total_prospects: 1,
      created_at: new Date().toISOString()
    },
    // Combinação 6
    {
      id: uuidv4(),
      stage: 'test',
      value: 1,
      count: 1,
      created_at: new Date().toISOString()
    },
    // Combinação 7 - Apenas campos obrigatórios
    {
      id: uuidv4(),
      created_at: new Date().toISOString()
    },
    // Combinação 8 - Sem stage
    {
      id: uuidv4(),
      leads: 1,
      prospects: 1,
      created_at: new Date().toISOString()
    },
    // Combinação 9 - Apenas id e stage
    {
      id: uuidv4(),
      stage: 'test',
      created_at: new Date().toISOString()
    },
    // Combinação 10 - Apenas id, stage e leads
    {
      id: uuidv4(),
      stage: 'test',
      leads: 1,
      created_at: new Date().toISOString()
    },
    // Combinação 11 - Apenas id, stage e prospects
    {
      id: uuidv4(),
      stage: 'test',
      prospects: 1,
      created_at: new Date().toISOString()
    }
  ];
  
  // Testar cada combinação
  for (let i = 0; i < columnCombinations.length; i++) {
    const combination = columnCombinations[i];
    console.log(`\nTestando combinação ${i + 1}:`, JSON.stringify(combination, null, 2));
    
    const { error } = await supabase.from('funnel_data').insert(combination);
    
    if (error) {
      console.log(`❌ Combinação ${i + 1} falhou:`, error.message);
      
      // Tentar extrair o campo inválido da mensagem de erro
      const invalidField = error.message.match(/column "([^"]+)" of relation/)?.[1];
      if (invalidField) {
        console.log(`Campo inválido detectado: ${invalidField}`);
      }
    } else {
      console.log(`✅ Combinação ${i + 1} bem-sucedida!`);
      console.log('Colunas válidas:', Object.keys(combination).join(', '));
      
      // Limpar o registro de teste
      await supabase.from('funnel_data').delete().eq('id', combination.id);
      
      // Encontramos uma combinação válida, não precisamos testar mais
      break;
    }
  }
}

// Executar o teste
async function main() {
  try {
    await testFunnelDataColumns();
    console.log('\n=== TESTE CONCLUÍDO ===');
  } catch (err) {
    console.error('Erro durante o teste:', err);
  }
}

main();