import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTableStructure(tableName) {
  console.log(`=== INSPECIONANDO ESTRUTURA DA TABELA ${tableName.toUpperCase()} ===`);
  
  try {
    // Executar SQL para obter informações sobre as colunas da tabela
    const { data, error } = await supabase.rpc('get_table_structure', { table_name: tableName });
    
    if (error) {
      console.error(`Erro ao obter estrutura da tabela ${tableName}:`, error.message);
      
      // Tentar método alternativo usando SQL direto
      console.log('Tentando método alternativo...');
      const { data: columns, error: columnsError } = await supabase.from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', tableName);
      
      if (columnsError) {
        console.error('Erro no método alternativo:', columnsError.message);
        return;
      }
      
      if (columns && columns.length > 0) {
        console.log(`Estrutura da tabela ${tableName}:`);
        columns.forEach(col => {
          console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
        });
      } else {
        console.log(`Nenhuma informação encontrada para a tabela ${tableName}.`);
      }
      
      return;
    }
    
    if (data) {
      console.log(`Estrutura da tabela ${tableName}:`);
      console.log(data);
    } else {
      console.log(`Nenhuma informação encontrada para a tabela ${tableName}.`);
    }
    
  } catch (err) {
    console.error('Erro durante a inspeção:', err.message);
  }
}

// Função para tentar inserir um registro com campos específicos e analisar o erro
async function testInsertWithField(tableName, fieldName) {
  const testRecord = {
    id: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }),
    [fieldName]: 1,
    created_at: new Date().toISOString()
  };
  
  console.log(`Testando campo '${fieldName}' na tabela ${tableName}...`);
  const { error } = await supabase.from(tableName).insert(testRecord);
  
  if (error) {
    if (error.message.includes(`column "${fieldName}" of relation`)) {
      console.log(`❌ Campo '${fieldName}' NÃO existe na tabela ${tableName}.`);
      return false;
    } else {
      console.log(`⚠️ Erro ao testar campo '${fieldName}':`, error.message);
      return false;
    }
  } else {
    console.log(`✅ Campo '${fieldName}' existe na tabela ${tableName}!`);
    // Limpar o registro de teste
    await supabase.from(tableName).delete().eq('id', testRecord.id);
    return true;
  }
}

async function testFunnelDataFields() {
  console.log('\n=== TESTANDO CAMPOS DA TABELA FUNNEL_DATA ===');
  
  // Lista de possíveis campos para testar
  const fieldsToTest = [
    'stage',
    'leads',
    'prospects',
    'leads_count',
    'prospects_count',
    'count_leads',
    'count_prospects',
    'lead_count',
    'prospect_count',
    'total_leads',
    'total_prospects',
    'value',
    'amount',
    'count'
  ];
  
  const validFields = [];
  
  for (const field of fieldsToTest) {
    const isValid = await testInsertWithField('funnel_data', field);
    if (isValid) {
      validFields.push(field);
    }
  }
  
  console.log('\n=== CAMPOS VÁLIDOS ENCONTRADOS ===');
  if (validFields.length > 0) {
    console.log(validFields.join(', '));
  } else {
    console.log('Nenhum campo válido encontrado entre os testados.');
  }
}

// Executar a inspeção
async function main() {
  try {
    // Primeiro, tentar obter a estrutura da tabela
    await inspectTableStructure('funnel_data');
    
    // Depois, testar campos específicos
    await testFunnelDataFields();
    
    console.log('\n=== INSPEÇÃO CONCLUÍDA ===');
  } catch (err) {
    console.error('Erro ao executar inspeção:', err);
  }
}

main();