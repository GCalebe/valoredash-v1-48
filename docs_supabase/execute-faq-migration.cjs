const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Erro: Chave do Supabase não encontrada!');
  console.log('Configure SUPABASE_SERVICE_ROLE_KEY ou VITE_SUPABASE_ANON_KEY no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeFAQMigration() {
  try {
    console.log('🚀 Iniciando migração da tabela FAQ...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'create-faq-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Arquivo SQL carregado com sucesso');
    
    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });
    
    if (error) {
      // Se a função exec_sql não existir, tentar executar diretamente
      console.log('⚠️  Função exec_sql não encontrada, tentando execução direta...');
      
      // Dividir o SQL em comandos individuais
      const commands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
      
      for (const command of commands) {
        if (command.trim()) {
          console.log(`Executando: ${command.substring(0, 50)}...`);
          const { error: cmdError } = await supabase.from('_').select('*').limit(0);
          
          // Como não podemos executar DDL diretamente via cliente JS,
          // vamos usar uma abordagem alternativa
          console.log('⚠️  Execução DDL via cliente JS não é suportada.');
          console.log('📋 Use o Supabase Dashboard ou CLI para executar o SQL:');
          console.log('\n' + sqlContent);
          break;
        }
      }
    } else {
      console.log('✅ Migração executada com sucesso!');
      console.log('📊 Resultado:', data);
    }
    
    // Verificar se a tabela foi criada
    console.log('🔍 Verificando se a tabela faq_items existe...');
    const { data: tableCheck, error: checkError } = await supabase
      .from('faq_items')
      .select('*')
      .limit(1);
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log('❌ Tabela faq_items não encontrada.');
        console.log('📋 Execute o SQL manualmente no Supabase Dashboard:');
        console.log('\n' + sqlContent);
      } else {
        console.log('❌ Erro ao verificar tabela:', checkError.message);
      }
    } else {
      console.log('✅ Tabela faq_items encontrada e acessível!');
      console.log('📊 Dados de exemplo:', tableCheck);
    }
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    console.log('\n📋 SQL para execução manual:');
    console.log('\n' + fs.readFileSync(path.join(__dirname, 'create-faq-table.sql'), 'utf8'));
  }
}

// Executar a migração
executeFAQMigration();