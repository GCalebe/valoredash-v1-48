#!/usr/bin/env node

/**
 * Script para verificar status da implementação e tentar corrigir problemas
 * Usa múltiplas abordagens para criar as tabelas restantes
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Erro: Variáveis de ambiente necessárias não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Definição das tabelas por fase
const TABELAS_POR_FASE = {
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

// SQLs para criar tabelas individuais (versão simplificada)
const TABELAS_SQL = {
  'n8n_chat_memory': `
    CREATE TABLE IF NOT EXISTS n8n_chat_memory (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id VARCHAR(255) NOT NULL,
      memory_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_n8n_chat_memory_session_id ON n8n_chat_memory(session_id);
    ALTER TABLE n8n_chat_memory ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can access chat memory" ON n8n_chat_memory FOR ALL USING (auth.uid() IS NOT NULL);
  `,
  'n8n_chat_histories': `
    CREATE TABLE IF NOT EXISTS n8n_chat_histories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id VARCHAR(255) NOT NULL,
      message_data JSONB NOT NULL,
      sender VARCHAR(100) CHECK (sender IN ('user', 'assistant', 'system')),
      message_type VARCHAR(50) DEFAULT 'text',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_id ON n8n_chat_histories(session_id);
    ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can access chat histories" ON n8n_chat_histories FOR ALL USING (auth.uid() IS NOT NULL);
  `,
  'chat_messages_backup': `
    CREATE TABLE IF NOT EXISTS chat_messages_backup (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      original_message_id UUID,
      session_id VARCHAR(255),
      message_data JSONB,
      backup_reason VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_chat_messages_backup_session_id ON chat_messages_backup(session_id);
    ALTER TABLE chat_messages_backup ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can access chat backups" ON chat_messages_backup FOR ALL USING (auth.uid() IS NOT NULL);
  `,
  'user_settings': `
    CREATE TABLE IF NOT EXISTS user_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      setting_key VARCHAR(100) NOT NULL,
      setting_value JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, setting_key)
    );
    CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
    ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage their own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
  `,
  'custom_field_definitions': `
    CREATE TABLE IF NOT EXISTS custom_field_definitions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      field_name VARCHAR(100) NOT NULL,
      field_type VARCHAR(50) CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select', 'multiselect')),
      field_options JSONB DEFAULT '{}',
      is_required BOOLEAN DEFAULT false,
      entity_type VARCHAR(50) CHECK (entity_type IN ('contact', 'conversation', 'product')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(field_name, entity_type)
    );
    ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Authenticated users can access custom field definitions" ON custom_field_definitions FOR SELECT USING (auth.uid() IS NOT NULL);
  `
};

async function verificarStatusAtual() {
  console.log('🔍 Verificando status atual da implementação...\n');
  
  let totalTabelas = 0;
  let tabelasImplementadas = 0;
  const statusPorFase = {};

  for (const [fase, tabelas] of Object.entries(TABELAS_POR_FASE)) {
    console.log(`📋 ${fase}:`);
    let implementadasFase = 0;
    const detalhes = [];
    
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
          detalhes.push({ tabela, status: 'implementada' });
        } else {
          console.log(`  ❌ ${tabela}`);
          detalhes.push({ tabela, status: 'pendente', erro: error.message });
        }
      } catch (err) {
        console.log(`  ❌ ${tabela}`);
        detalhes.push({ tabela, status: 'pendente', erro: err.message });
      }
    }
    
    const percentual = Math.round((implementadasFase / tabelas.length) * 100);
    console.log(`  📈 Progresso: ${implementadasFase}/${tabelas.length} (${percentual}%)\n`);
    
    statusPorFase[fase] = {
      implementadas: implementadasFase,
      total: tabelas.length,
      percentual,
      detalhes
    };
  }

  const progressoTotal = Math.round((tabelasImplementadas / totalTabelas) * 100);
  console.log(`🎯 PROGRESSO TOTAL: ${tabelasImplementadas}/${totalTabelas} tabelas (${progressoTotal}%)\n`);
  
  return {
    totalTabelas,
    tabelasImplementadas,
    progressoTotal,
    statusPorFase
  };
}

async function tentarCriarTabelaIndividual(nomeTabela, sql) {
  console.log(`🔧 Tentando criar tabela: ${nomeTabela}`);
  
  try {
    // Método 1: Tentar com rpc
    const { error: rpcError } = await supabase.rpc('exec', { sql });
    
    if (!rpcError) {
      console.log(`  ✅ Criada com sucesso via RPC`);
      return true;
    }
    
    console.log(`  ⚠️  RPC falhou: ${rpcError.message}`);
    
    // Método 2: Tentar executar comandos individuais
    const comandos = sql.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (const comando of comandos) {
      if (comando.trim().startsWith('CREATE TABLE')) {
        try {
          // Tentar criar apenas a tabela básica
          const { error } = await supabase.rpc('exec', { sql: comando + ';' });
          if (!error) {
            console.log(`  ✅ Tabela básica criada`);
            return true;
          }
        } catch (err) {
          console.log(`  ⚠️  Comando falhou: ${err.message}`);
        }
      }
    }
    
    return false;
    
  } catch (error) {
    console.log(`  ❌ Erro geral: ${error.message}`);
    return false;
  }
}

async function tentarCorrigirTabelasPendentes(status) {
  console.log('🔧 Tentando corrigir tabelas pendentes...\n');
  
  let tabelasCorrigidas = 0;
  
  for (const [fase, info] of Object.entries(status.statusPorFase)) {
    console.log(`📋 Corrigindo ${fase}:`);
    
    for (const detalhe of info.detalhes) {
      if (detalhe.status === 'pendente' && TABELAS_SQL[detalhe.tabela]) {
        const sucesso = await tentarCriarTabelaIndividual(
          detalhe.tabela, 
          TABELAS_SQL[detalhe.tabela]
        );
        
        if (sucesso) {
          tabelasCorrigidas++;
        }
      }
    }
    
    console.log('');
  }
  
  console.log(`📊 Resultado: ${tabelasCorrigidas} tabelas corrigidas\n`);
  return tabelasCorrigidas;
}

async function gerarRelatorioFinal(statusInicial, statusFinal) {
  console.log('📊 RELATÓRIO FINAL DA CORREÇÃO');
  console.log('=' .repeat(50));
  
  console.log(`\n📈 Progresso:`);
  console.log(`  Antes: ${statusInicial.tabelasImplementadas}/${statusInicial.totalTabelas} (${statusInicial.progressoTotal}%)`);
  console.log(`  Depois: ${statusFinal.tabelasImplementadas}/${statusFinal.totalTabelas} (${statusFinal.progressoTotal}%)`);
  
  const melhoria = statusFinal.progressoTotal - statusInicial.progressoTotal;
  if (melhoria > 0) {
    console.log(`  🎉 Melhoria: +${melhoria}%`);
  } else {
    console.log(`  ⚠️  Sem melhoria significativa`);
  }
  
  console.log(`\n📋 Próximas ações recomendadas:`);
  
  if (statusFinal.progressoTotal < 50) {
    console.log(`  1. ⚠️  Executar migrações manualmente no painel do Supabase`);
    console.log(`  2. 🔧 Verificar permissões do service role key`);
    console.log(`  3. 📞 Contatar suporte do Supabase se necessário`);
  } else if (statusFinal.progressoTotal < 80) {
    console.log(`  1. ✅ Continuar com implementação das fases restantes`);
    console.log(`  2. 🧪 Implementar testes para tabelas criadas`);
    console.log(`  3. 🔄 Atualizar hooks do React`);
  } else {
    console.log(`  1. 🎉 Implementação quase completa!`);
    console.log(`  2. 🧪 Implementar testes completos`);
    console.log(`  3. 🚀 Preparar para produção`);
  }
  
  // Salvar relatório em arquivo
  const relatorio = {
    timestamp: new Date().toISOString(),
    statusInicial,
    statusFinal,
    melhoria,
    proximasAcoes: statusFinal.progressoTotal < 50 ? 'manual' : statusFinal.progressoTotal < 80 ? 'continuar' : 'finalizar'
  };
  
  const relatorioPath = path.join(__dirname, '..', 'docs_supabase', '01-documentacao', 'relatorio-correcao.json');
  fs.writeFileSync(relatorioPath, JSON.stringify(relatorio, null, 2));
  console.log(`\n💾 Relatório salvo em: ${relatorioPath}`);
}

async function main() {
  console.log('🎯 VERIFICAÇÃO E CORREÇÃO DA IMPLEMENTAÇÃO');
  console.log('=' .repeat(50));
  
  try {
    // Verificar status inicial
    const statusInicial = await verificarStatusAtual();
    
    // Tentar corrigir problemas
    if (statusInicial.progressoTotal < 100) {
      await tentarCorrigirTabelasPendentes(statusInicial);
      
      // Verificar status final
      console.log('🔄 Verificando status após correções...\n');
      const statusFinal = await verificarStatusAtual();
      
      // Gerar relatório
      await gerarRelatorioFinal(statusInicial, statusFinal);
    } else {
      console.log('🎉 Todas as tabelas já estão implementadas!');
    }
    
  } catch (error) {
    console.error('💥 Erro durante a verificação:', error.message);
    process.exit(1);
  }
}

// Executar o script
main().catch(console.error);

export { verificarStatusAtual, tentarCorrigirTabelasPendentes };