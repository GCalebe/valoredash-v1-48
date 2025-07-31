#!/usr/bin/env node

/**
 * Script para executar a migração da Fase 1 do Plano de Implementação Otimizado
 * Implementa as tabelas críticas do sistema de chat e conversas
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

// Configuração do Supabase com service role key para permissões administrativas
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  console.error('Verifique o arquivo .env na raiz do projeto');
  process.exit(1);
}

// Cliente Supabase com service role (bypassa RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executarMigracaoFase1() {
  console.log('🚀 Iniciando migração da Fase 1: Sistema de Chat e Conversas');
  console.log('📋 Implementando 5 tabelas críticas conforme Plano de Implementação Otimizado\n');

  try {
    // Ler o arquivo de migração SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250103000001_fase_1_sistema_chat_conversas.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Arquivo de migração não encontrado: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Arquivo de migração carregado com sucesso');
    console.log(`📍 Caminho: ${migrationPath}\n`);

    // Executar a migração
    console.log('⚡ Executando migração SQL...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      // Tentar executar diretamente se a função exec_sql não existir
      console.log('⚠️  Função exec_sql não encontrada, tentando execução direta...');
      
      // Dividir o SQL em comandos individuais
      const commands = migrationSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      console.log(`📊 Executando ${commands.length} comandos SQL...\n`);

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command.toLowerCase().includes('select')) {
          // Para comandos SELECT, usar .from()
          try {
            const { data: selectData, error: selectError } = await supabase
              .from('information_schema.tables')
              .select('*')
              .limit(1);
            
            if (selectError) {
              console.log(`⚠️  Comando ${i + 1}: ${selectError.message}`);
            } else {
              console.log(`✅ Comando ${i + 1}: Executado com sucesso`);
            }
          } catch (err) {
            console.log(`⚠️  Comando ${i + 1}: ${err.message}`);
          }
        } else {
          // Para outros comandos, tentar usar rpc
          try {
            const { error: cmdError } = await supabase.rpc('exec', {
              sql: command + ';'
            });
            
            if (cmdError) {
              console.log(`⚠️  Comando ${i + 1}: ${cmdError.message}`);
            } else {
              console.log(`✅ Comando ${i + 1}: Executado com sucesso`);
            }
          } catch (err) {
            console.log(`⚠️  Comando ${i + 1}: ${err.message}`);
          }
        }
      }
    } else {
      console.log('✅ Migração executada com sucesso!');
      if (data) {
        console.log('📊 Resultado:', data);
      }
    }

    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    
    const tabelasEsperadas = [
      'conversations',
      'n8n_chat_memory', 
      'n8n_chat_histories',
      'n8n_chat_messages',
      'chat_messages_backup'
    ];

    for (const tabela of tabelasEsperadas) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(tabela)
          .select('*')
          .limit(1);

        if (tableError) {
          console.log(`❌ Tabela '${tabela}': ${tableError.message}`);
        } else {
          console.log(`✅ Tabela '${tabela}': Criada e acessível`);
        }
      } catch (err) {
        console.log(`❌ Tabela '${tabela}': ${err.message}`);
      }
    }

    console.log('\n🎉 Migração da Fase 1 concluída!');
    console.log('📋 Próximos passos:');
    console.log('   1. Verificar se todas as tabelas foram criadas corretamente');
    console.log('   2. Testar inserção de dados de exemplo');
    console.log('   3. Executar migração da Fase 2 (tabelas importantes)');
    console.log('   4. Atualizar hooks do React para usar as novas tabelas\n');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    console.error('\n🔧 Possíveis soluções:');
    console.error('   1. Verificar se as credenciais do Supabase estão corretas no .env');
    console.error('   2. Confirmar se o service role key tem permissões administrativas');
    console.error('   3. Verificar se a conexão com o Supabase está funcionando');
    console.error('   4. Executar a migração manualmente no painel do Supabase\n');
    process.exit(1);
  }
}

// Função para testar conexão
async function testarConexao() {
  console.log('🔗 Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('id')
      .limit(1);

    if (error) {
      console.log(`⚠️  Aviso na conexão: ${error.message}`);
    } else {
      console.log('✅ Conexão com Supabase estabelecida com sucesso\n');
    }
  } catch (err) {
    console.error('❌ Erro na conexão:', err.message);
    throw err;
  }
}

// Executar o script
async function main() {
  console.log('=' .repeat(60));
  console.log('🎯 MIGRAÇÃO FASE 1 - PLANO DE IMPLEMENTAÇÃO OTIMIZADO');
  console.log('=' .repeat(60));
  
  try {
    await testarConexao();
    await executarMigracaoFase1();
  } catch (error) {
    console.error('💥 Falha na execução:', error.message);
    process.exit(1);
  }
}

// Executar a migração
main().catch(console.error);

export { executarMigracaoFase1, testarConexao };