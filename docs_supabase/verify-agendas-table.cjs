// Script para verificar se a tabela agendas foi criada corretamente
const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');

// Carregar variáveis de ambiente
config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAgendasTable() {
  console.log('=== VERIFICANDO TABELA AGENDAS ===');
  console.log('URL:', supabaseUrl);
  
  try {
    // Verificar se a tabela existe e consultar dados
    const { data, error } = await supabase
      .from('agendas')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ Erro ao consultar tabela agendas:', error.message);
      return false;
    }
    
    console.log('✅ Tabela agendas encontrada!');
    console.log(`📊 Total de registros encontrados: ${data.length}`);
    
    if (data.length > 0) {
      console.log('\n=== ESTRUTURA DA TABELA ===');
      const firstRecord = data[0];
      Object.keys(firstRecord).forEach(key => {
        const value = firstRecord[key];
        const type = typeof value;
        console.log(`- ${key}: ${type} (${value !== null ? 'valor: ' + String(value).substring(0, 50) : 'null'})`);
      });
      
      console.log('\n=== DADOS DE EXEMPLO ===');
      data.forEach((record, index) => {
        console.log(`\nRegistro ${index + 1}:`);
        console.log(`  Nome: ${record.name}`);
        console.log(`  Descrição: ${record.description ? record.description.substring(0, 100) + '...' : 'N/A'}`);
        console.log(`  Duração: ${record.duration_minutes} minutos`);
        console.log(`  Preço: R$ ${record.price || 'N/A'}`);
        console.log(`  Categoria: ${record.category || 'N/A'}`);
        console.log(`  Ativo: ${record.is_active ? 'Sim' : 'Não'}`);
        console.log(`  Max Participantes: ${record.max_participants}`);
      });
    } else {
      console.log('⚠️  Tabela existe mas não contém dados.');
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Erro durante verificação:', err.message);
    return false;
  }
}

async function testConnection() {
  console.log('\n=== TESTANDO CONEXÃO ===');
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase OK');
    return true;
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando verificação da tabela agendas...');
  
  // Testar conexão primeiro
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('❌ Falha na conexão. Abortando verificação.');
    return;
  }
  
  // Verificar tabela agendas
  const tableOk = await verifyAgendasTable();
  
  console.log('\n=== RESUMO ===');
  if (tableOk) {
    console.log('✅ Fase 1 implementada com sucesso!');
    console.log('📋 Tabela agendas criada e funcionando corretamente.');
    console.log('\n🎯 PRÓXIMO PASSO: Implementar Fase 2 - Tabelas de Horários de Funcionamento');
    console.log('   - agenda_operating_hours');
    console.log('   - agenda_available_dates');
  } else {
    console.log('❌ Problemas encontrados na implementação da Fase 1.');
  }
}

// Executar verificação
main().catch(console.error);