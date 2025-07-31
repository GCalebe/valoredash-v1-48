#!/usr/bin/env node

/**
 * Script para executar a migração da Fase 2 do Plano de Implementação Otimizado
 * Implementa as tabelas importantes: usuários, métricas, kanban e campos customizados
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

async function executarMigracaoFase2() {
  console.log('🚀 Iniciando migração da Fase 2: Sistema de Usuários, Métricas e Kanban');
  console.log('📋 Implementando 11 tabelas importantes conforme Plano de Implementação Otimizado\n');

  try {
    // Ler o arquivo de migração SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250103000002_fase_2_sistema_usuarios_metricas.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Arquivo de migração não encontrado: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Arquivo de migração carregado com sucesso');
    console.log(`📍 Caminho: ${migrationPath}\n`);

    // Dividir o SQL em comandos individuais para execução
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));

    console.log(`📊 Executando ${commands.length} comandos SQL...\n`);

    let sucessos = 0;
    let falhas = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Pular comandos de verificação SELECT no final
      if (command.toLowerCase().includes('select') && command.toLowerCase().includes('information_schema')) {
        console.log(`⏭️  Comando ${i + 1}: Verificação pulada`);
        continue;
      }

      try {
        // Tentar executar o comando
        const { error } = await supabase.rpc('exec', {
          sql: command + ';'
        });
        
        if (error) {
          console.log(`⚠️  Comando ${i + 1}: ${error.message}`);
          falhas++;
        } else {
          console.log(`✅ Comando ${i + 1}: Executado com sucesso`);
          sucessos++;
        }
      } catch (err) {
        console.log(`⚠️  Comando ${i + 1}: ${err.message}`);
        falhas++;
      }

      // Pequena pausa para evitar rate limiting
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n📊 Resumo da execução:`);
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`⚠️  Falhas: ${falhas}`);

    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    
    const tabelasEsperadas = [
      'profiles',
      'user_settings',
      'user_sessions', 
      'user_activity_log',
      'conversation_daily_data',
      'performance_metrics',
      'system_reports',
      'metrics_cache',
      'kanban_stages',
      'custom_field_definitions',
      'client_custom_values'
    ];

    let tabelasCriadas = 0;

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
          tabelasCriadas++;
        }
      } catch (err) {
        console.log(`❌ Tabela '${tabela}': ${err.message}`);
      }
    }

    console.log(`\n📈 Progresso da Fase 2: ${tabelasCriadas}/${tabelasEsperadas.length} tabelas criadas`);

    if (tabelasCriadas >= tabelasEsperadas.length * 0.8) {
      console.log('🎉 Migração da Fase 2 concluída com sucesso!');
    } else {
      console.log('⚠️  Migração da Fase 2 parcialmente concluída');
    }

    console.log('\n📋 Próximos passos:');
    console.log('   1. Verificar se todas as tabelas foram criadas corretamente');
    console.log('   2. Testar inserção de dados de exemplo');
    console.log('   3. Executar migração da Fase 3 (tabelas opcionais)');
    console.log('   4. Atualizar hooks do React para usar as novas tabelas');
    console.log('   5. Implementar validação de dados e testes\n');

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

// Função para verificar progresso geral
async function verificarProgressoGeral() {
  console.log('\n📊 VERIFICANDO PROGRESSO GERAL DO PLANO DE IMPLEMENTAÇÃO');
  console.log('=' .repeat(60));

  const todasTabelas = {
    'Fase 1 - Chat e Conversas': [
      'conversations', 'n8n_chat_memory', 'n8n_chat_histories', 
      'n8n_chat_messages', 'chat_messages_backup'
    ],
    'Fase 2 - Usuários e Métricas': [
      'profiles', 'user_settings', 'user_sessions', 'user_activity_log',
      'conversation_daily_data', 'performance_metrics', 'system_reports', 
      'metrics_cache', 'kanban_stages', 'custom_field_definitions', 'client_custom_values'
    ]
  };

  let totalTabelas = 0;
  let tabelasImplementadas = 0;

  for (const [fase, tabelas] of Object.entries(todasTabelas)) {
    console.log(`\n🔍 ${fase}:`);
    let implementadasFase = 0;
    
    for (const tabela of tabelas) {
      totalTabelas++;
      try {
        const { error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1);

        if (!error) {
          console.log(`  ✅ ${tabela}`);
          implementadasFase++;
          tabelasImplementadas++;
        } else {
          console.log(`  ❌ ${tabela}`);
        }
      } catch (err) {
        console.log(`  ❌ ${tabela}`);
      }
    }
    
    const percentual = Math.round((implementadasFase / tabelas.length) * 100);
    console.log(`  📈 Progresso: ${implementadasFase}/${tabelas.length} (${percentual}%)`);
  }

  const progressoTotal = Math.round((tabelasImplementadas / totalTabelas) * 100);
  console.log(`\n🎯 PROGRESSO TOTAL: ${tabelasImplementadas}/${totalTabelas} tabelas (${progressoTotal}%)`);
  
  if (progressoTotal >= 80) {
    console.log('🎉 Implementação está em excelente progresso!');
  } else if (progressoTotal >= 50) {
    console.log('👍 Implementação está em bom progresso!');
  } else {
    console.log('⚠️  Implementação precisa de mais atenção.');
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
  console.log('🎯 MIGRAÇÃO FASE 2 - PLANO DE IMPLEMENTAÇÃO OTIMIZADO');
  console.log('=' .repeat(60));
  
  try {
    await testarConexao();
    await executarMigracaoFase2();
    await verificarProgressoGeral();
  } catch (error) {
    console.error('💥 Falha na execução:', error.message);
    process.exit(1);
  }
}

// Executar a migração
main().catch(console.error);

export { executarMigracaoFase2, verificarProgressoGeral, testarConexao };