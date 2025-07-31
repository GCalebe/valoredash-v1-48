// Script para executar a migração completa do banco de dados via Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Chave de serviço necessária para operações administrativas
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

// Criar cliente Supabase (usar service key se disponível)
const supabase = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Função para executar SQL via RPC (se disponível)
async function executeSQL(sql, description) {
  console.log(`\n🔄 Executando: ${description}`);
  
  try {
    // Tentar usar a função RPC se estiver disponível
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
    
    if (error) {
      console.error(`❌ Erro: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Sucesso: ${description}`);
    return true;
  } catch (err) {
    console.error(`❌ Erro ao executar SQL: ${err.message}`);
    return false;
  }
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

// Função principal de migração
async function executeDatabaseMigration() {
  console.log('🗄️ === MIGRAÇÃO COMPLETA DO BANCO DE DADOS - VALORE CRM V2 ===');
  console.log(`📡 URL: ${supabaseUrl}`);
  console.log(`🔑 Usando chave: ${supabaseServiceKey ? 'Service Role' : 'Anon Key'}`);
  
  if (!supabaseServiceKey) {
    console.log('\n⚠️  AVISO: Usando chave anônima. Para operações administrativas, configure SUPABASE_SERVICE_ROLE_KEY');
  }
  
  try {
    // Ler o arquivo de migração completa
    console.log('\n📖 Lendo arquivo de migração...');
    const migrationSQL = fs.readFileSync('./complete_database_migration.sql', 'utf8');
    
    // Dividir o SQL em comandos individuais
    const sqlCommands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));
    
    console.log(`📋 Encontrados ${sqlCommands.length} comandos SQL para executar`);
    
    // Lista de tabelas que esperamos criar
    const expectedTables = [
      'calendar_events',
      'calendar_attendees', 
      'appointments',
      'pricing_plans',
      'user_subscriptions',
      'payment_methods',
      'invoices',
      'invoice_items',
      'payment_history',
      'discount_coupons',
      'coupon_redemptions',
      'monthly_growth',
      'conversation_daily_data',
      'conversion_by_time',
      'leads_by_source',
      'leads_over_time',
      'campaign_data',
      'conversations'
    ];
    
    console.log('\n🔍 Verificando tabelas existentes...');
    const existingTables = [];
    const missingTables = [];
    
    for (const table of expectedTables) {
      const exists = await tableExists(table);
      if (exists) {
        existingTables.push(table);
        console.log(`✅ ${table} - já existe`);
      } else {
        missingTables.push(table);
        console.log(`❌ ${table} - não existe`);
      }
    }
    
    console.log(`\n📊 Resumo: ${existingTables.length} existentes, ${missingTables.length} faltando`);
    
    if (missingTables.length === 0) {
      console.log('\n🎉 Todas as tabelas já existem! Migração não necessária.');
      return;
    }
    
    console.log('\n⚠️  LIMITAÇÃO: Não é possível executar DDL via cliente JavaScript do Supabase');
    console.log('\n📋 INSTRUÇÕES PARA EXECUTAR A MIGRAÇÃO:');
    console.log('\n1. 🌐 Acesse o painel do Supabase:');
    console.log('   https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0]);
    console.log('\n2. 🛠️  Vá para "SQL Editor"');
    console.log('\n3. 📄 Abra o arquivo: complete_database_migration.sql');
    console.log('\n4. 📋 Copie todo o conteúdo do arquivo');
    console.log('\n5. 📝 Cole no SQL Editor do Supabase');
    console.log('\n6. ▶️  Clique em "Run" para executar');
    console.log('\n7. ✅ Verifique se não há erros');
    
    console.log('\n📁 ARQUIVOS DISPONÍVEIS PARA MIGRAÇÃO:');
    console.log('   • complete_database_migration.sql - Migração completa (RECOMENDADO)');
    console.log('   • create_calendar_tables.sql - Apenas tabelas de agenda');
    console.log('   • create_subscription_tables.sql - Apenas tabelas de assinatura');
    console.log('   • missing-tables.sql - Apenas tabelas de analytics');
    
    console.log('\n🔍 VERIFICAÇÃO PÓS-MIGRAÇÃO:');
    console.log('   Execute: npm run verify-migration');
    
    // Criar um script de verificação rápida
    await createVerificationScript();
    
  } catch (err) {
    console.error('❌ Erro durante a migração:', err.message);
  }
}

// Função para criar script de verificação
async function createVerificationScript() {
  const verificationScript = `// Script de verificação pós-migração
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const expectedTables = [
  'calendar_events', 'calendar_attendees', 'appointments',
  'pricing_plans', 'user_subscriptions', 'payment_methods', 'invoices',
  'monthly_growth', 'conversation_daily_data', 'conversion_by_time',
  'leads_by_source', 'leads_over_time', 'campaign_data', 'conversations'
];

async function verifyMigration() {
  console.log('🔍 Verificando migração...');
  
  let success = 0;
  let failed = 0;
  
  for (const table of expectedTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.message.includes('does not exist')) {
        console.log(\`❌ \${table} - NÃO EXISTE\`);
        failed++;
      } else {
        console.log(\`✅ \${table} - OK\`);
        success++;
      }
    } catch (err) {
      console.log(\`❌ \${table} - ERRO: \${err.message}\`);
      failed++;
    }
  }
  
  console.log(\`\n📊 Resultado: \${success} OK, \${failed} com problemas\`);
  
  if (failed === 0) {
    console.log('🎉 Migração concluída com sucesso!');
  } else {
    console.log('⚠️  Algumas tabelas ainda precisam ser criadas.');
  }
}

verifyMigration().catch(console.error);
`;
  
  fs.writeFileSync('./verify-migration.js', verificationScript);
  console.log('\n📄 Script de verificação criado: verify-migration.js');
}

// Função para mostrar informações do projeto
async function showProjectInfo() {
  console.log('\n📋 INFORMAÇÕES DO PROJETO:');
  
  try {
    // Tentar obter informações básicas
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log('✅ Conexão com Supabase: OK');
      console.log('✅ Tabela profiles: Existe');
    } else {
      console.log('❌ Problema na conexão ou tabela profiles não existe');
    }
  } catch (err) {
    console.log('❌ Erro na conexão:', err.message);
  }
}

// Executar migração
console.log('🚀 Iniciando processo de migração...');
showProjectInfo()
  .then(() => executeDatabaseMigration())
  .catch(console.error);