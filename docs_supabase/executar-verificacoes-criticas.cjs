#!/usr/bin/env node

/**
 * Script para Executar Verificações Críticas do Banco de Dados
 * 
 * Este script automatiza as verificações identificadas no CHECKLIST_MELHORIAS_BANCO_DADOS.md
 * focando nos problemas críticos que precisam ser resolvidos imediatamente.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Tabelas críticas que não podem estar vazias
const TABELAS_CRITICAS = [
  'contacts',
  'profiles', 
  'n8n_chat_memory',
  'n8n_chat_histories',
  'user_sessions',
  'user_settings'
];

// Tabelas com alto uso no código
const TABELAS_ALTO_USO = [
  'contacts',
  'conversations', 
  'kanban_stages',
  'profiles',
  'n8n_chat_messages',
  'agendas'
];

// Foreign keys críticas que devem existir
const FOREIGN_KEYS_CRITICAS = [
  {
    tabela: 'contacts',
    coluna: 'user_id',
    referencia: 'profiles(id)',
    nome: 'fk_contacts_user_id'
  },
  {
    tabela: 'client_custom_values',
    coluna: 'client_id', 
    referencia: 'contacts(id)',
    nome: 'fk_client_custom_values_client_id'
  },
  {
    tabela: 'contact_stage_history',
    coluna: 'contact_id',
    referencia: 'contacts(id)', 
    nome: 'fk_contact_stage_history_contact_id'
  },
  {
    tabela: 'agenda_bookings',
    coluna: 'agenda_id',
    referencia: 'agendas(id)',
    nome: 'fk_agenda_bookings_agenda_id'
  },
  {
    tabela: 'calendar_events',
    coluna: 'user_id',
    referencia: 'profiles(id)',
    nome: 'fk_calendar_events_user_id'
  }
];

/**
 * Função para executar query SQL
 */
async function executarSQL(query) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    if (error) {
      console.error('Erro na query:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Erro ao executar SQL:', err.message);
    return null;
  }
}

/**
 * Verificar tabelas vazias críticas
 */
async function verificarTabelasVaziasCriticas() {
  console.log('\n🔍 VERIFICANDO TABELAS VAZIAS CRÍTICAS');
  console.log('=' .repeat(50));
  
  const problemasCriticos = [];
  
  for (const tabela of TABELAS_CRITICAS) {
    try {
      const { data, error } = await supabase
        .from(tabela)
        .select('id', { count: 'exact', head: true });
      
      const count = data?.length || 0;
      const status = count === 0 ? '🔴 CRÍTICO' : '✅ OK';
      
      console.log(`${status} ${tabela.padEnd(25)} | ${count} registros`);
      
      if (count === 0) {
        problemasCriticos.push({
          tipo: 'TABELA_VAZIA_CRITICA',
          tabela: tabela,
          descricao: `Tabela crítica ${tabela} está vazia`,
          impacto: 'ALTO',
          acao: 'Investigar por que está vazia e popular com dados iniciais'
        });
      }
    } catch (err) {
      console.log(`❌ ERRO ${tabela.padEnd(25)} | ${err.message}`);
      problemasCriticos.push({
        tipo: 'TABELA_INACESSIVEL',
        tabela: tabela,
        descricao: `Não foi possível acessar a tabela ${tabela}`,
        impacto: 'CRÍTICO',
        acao: 'Verificar se a tabela existe e se há permissões adequadas'
      });
    }
  }
  
  return problemasCriticos;
}

/**
 * Verificar foreign keys implementadas
 */
async function verificarForeignKeys() {
  console.log('\n🔗 VERIFICANDO FOREIGN KEYS CRÍTICAS');
  console.log('=' .repeat(50));
  
  const query = `
    SELECT 
      tc.table_name,
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name;
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    
    if (error) {
      console.log('❌ Erro ao verificar foreign keys:', error.message);
      return [];
    }
    
    const fksExistentes = data || [];
    const problemas = [];
    
    console.log(`📊 Foreign Keys encontradas: ${fksExistentes.length}`);
    
    // Verificar cada foreign key crítica
    for (const fkCritica of FOREIGN_KEYS_CRITICAS) {
      const existe = fksExistentes.some(fk => 
        fk.table_name === fkCritica.tabela && 
        fk.column_name === fkCritica.coluna
      );
      
      const status = existe ? '✅ OK' : '🔴 FALTANDO';
      console.log(`${status} ${fkCritica.tabela}.${fkCritica.coluna} → ${fkCritica.referencia}`);
      
      if (!existe) {
        problemas.push({
          tipo: 'FOREIGN_KEY_FALTANDO',
          tabela: fkCritica.tabela,
          coluna: fkCritica.coluna,
          referencia: fkCritica.referencia,
          nome: fkCritica.nome,
          descricao: `Foreign key faltando: ${fkCritica.tabela}.${fkCritica.coluna}`,
          impacto: 'ALTO',
          acao: `Implementar: ALTER TABLE ${fkCritica.tabela} ADD CONSTRAINT ${fkCritica.nome} FOREIGN KEY (${fkCritica.coluna}) REFERENCES ${fkCritica.referencia};`
        });
      }
    }
    
    return problemas;
  } catch (err) {
    console.log('❌ Erro ao verificar foreign keys:', err.message);
    return [];
  }
}

/**
 * Verificar tabelas com dados mas sem uso no código
 */
async function verificarTabelasNaoUtilizadas() {
  console.log('\n📊 VERIFICANDO TABELAS COM DADOS MAS SEM USO NO CÓDIGO');
  console.log('=' .repeat(50));
  
  const query = `
    SELECT 
      relname as tabela,
      n_live_tup as registros
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
      AND n_live_tup > 0
    ORDER BY n_live_tup DESC;
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    
    if (error) {
      console.log('❌ Erro ao verificar tabelas:', error.message);
      return [];
    }
    
    const tabelasComDados = data || [];
    const problemas = [];
    
    // Tabelas conhecidas por não terem uso no código
    const tabelasSemUso = [
      'faq_items',
      'stage_name_mapping', 
      'knowledge_tags',
      'utm_tracking',
      'knowledge_categories',
      'knowledge_analytics'
    ];
    
    for (const tabela of tabelasComDados) {
      if (tabelasSemUso.includes(tabela.tabela)) {
        const status = '⚠️ SEM USO';
        console.log(`${status} ${tabela.tabela.padEnd(25)} | ${tabela.registros} registros`);
        
        problemas.push({
          tipo: 'TABELA_SEM_USO_NO_CODIGO',
          tabela: tabela.tabela,
          registros: tabela.registros,
          descricao: `Tabela ${tabela.tabela} tem ${tabela.registros} registros mas não é usada no código`,
          impacto: 'MÉDIO',
          acao: 'Verificar se é funcionalidade não implementada no frontend ou se pode ser removida'
        });
      }
    }
    
    return problemas;
  } catch (err) {
    console.log('❌ Erro ao verificar tabelas não utilizadas:', err.message);
    return [];
  }
}

/**
 * Verificar tabelas de backup suspeitas
 */
async function verificarTabelasBackup() {
  console.log('\n💾 VERIFICANDO TABELAS DE BACKUP SUSPEITAS');
  console.log('=' .repeat(50));
  
  const query = `
    SELECT 
      relname as tabela,
      n_live_tup as registros,
      n_tup_ins + n_tup_upd + n_tup_del as atividade
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
      AND (relname LIKE '%backup%' OR relname LIKE '%_bak%')
    ORDER BY n_live_tup DESC;
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
    
    if (error) {
      console.log('❌ Erro ao verificar tabelas de backup:', error.message);
      return [];
    }
    
    const tabelasBackup = data || [];
    const problemas = [];
    
    for (const tabela of tabelasBackup) {
      const status = tabela.registros > 0 ? '⚠️ ATIVA' : '✅ VAZIA';
      console.log(`${status} ${tabela.tabela.padEnd(30)} | ${tabela.registros} registros | ${tabela.atividade} atividade`);
      
      if (tabela.registros > 0) {
        problemas.push({
          tipo: 'TABELA_BACKUP_ATIVA',
          tabela: tabela.tabela,
          registros: tabela.registros,
          atividade: tabela.atividade,
          descricao: `Tabela de backup ${tabela.tabela} tem dados ativos`,
          impacto: 'MÉDIO',
          acao: 'Verificar se é realmente backup ou tabela ativa mal nomeada'
        });
      }
    }
    
    return problemas;
  } catch (err) {
    console.log('❌ Erro ao verificar tabelas de backup:', err.message);
    return [];
  }
}

/**
 * Gerar relatório de problemas
 */
function gerarRelatorio(problemas) {
  const agora = new Date().toISOString();
  const relatorio = {
    data_verificacao: agora,
    total_problemas: problemas.length,
    problemas_criticos: problemas.filter(p => p.impacto === 'CRÍTICO' || p.impacto === 'ALTO').length,
    problemas_medios: problemas.filter(p => p.impacto === 'MÉDIO').length,
    problemas: problemas,
    resumo: {
      tabelas_vazias_criticas: problemas.filter(p => p.tipo === 'TABELA_VAZIA_CRITICA').length,
      foreign_keys_faltando: problemas.filter(p => p.tipo === 'FOREIGN_KEY_FALTANDO').length,
      tabelas_sem_uso: problemas.filter(p => p.tipo === 'TABELA_SEM_USO_NO_CODIGO').length,
      tabelas_backup_ativas: problemas.filter(p => p.tipo === 'TABELA_BACKUP_ATIVA').length
    }
  };
  
  // Salvar relatório
  const nomeArquivo = `verificacao-critica-${new Date().toISOString().split('T')[0]}.json`;
  const caminhoArquivo = path.join(__dirname, nomeArquivo);
  
  fs.writeFileSync(caminhoArquivo, JSON.stringify(relatorio, null, 2));
  
  return { relatorio, caminhoArquivo };
}

/**
 * Gerar scripts SQL de correção
 */
function gerarScriptsCorrecao(problemas) {
  const scriptsSQL = [];
  
  // Scripts para foreign keys
  const fkProblemas = problemas.filter(p => p.tipo === 'FOREIGN_KEY_FALTANDO');
  if (fkProblemas.length > 0) {
    scriptsSQL.push('-- IMPLEMENTAR FOREIGN KEYS CRÍTICAS');
    scriptsSQL.push('');
    
    for (const problema of fkProblemas) {
      scriptsSQL.push(`-- ${problema.descricao}`);
      scriptsSQL.push(problema.acao);
      scriptsSQL.push('');
    }
  }
  
  // Scripts para investigação de tabelas vazias
  const tabelasVazias = problemas.filter(p => p.tipo === 'TABELA_VAZIA_CRITICA');
  if (tabelasVazias.length > 0) {
    scriptsSQL.push('-- INVESTIGAR TABELAS VAZIAS CRÍTICAS');
    scriptsSQL.push('');
    
    for (const problema of tabelasVazias) {
      scriptsSQL.push(`-- Verificar triggers e procedures para ${problema.tabela}`);
      scriptsSQL.push(`SELECT * FROM information_schema.triggers WHERE event_object_table = '${problema.tabela}';`);
      scriptsSQL.push(`SELECT n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables WHERE relname = '${problema.tabela}';`);
      scriptsSQL.push('');
    }
  }
  
  const sqlContent = scriptsSQL.join('\n');
  const nomeArquivo = `scripts-correcao-${new Date().toISOString().split('T')[0]}.sql`;
  const caminhoArquivo = path.join(__dirname, nomeArquivo);
  
  fs.writeFileSync(caminhoArquivo, sqlContent);
  
  return caminhoArquivo;
}

/**
 * Função principal
 */
async function main() {
  console.clear();
  console.log('🔧 EXECUTANDO VERIFICAÇÕES CRÍTICAS DO BANCO DE DADOS');
  console.log('====================================================');
  console.log(`Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`Projeto: ValoreDash V1-48`);
  
  const todosProblemas = [];
  
  try {
    // Executar todas as verificações
    const problemasTabelasVazias = await verificarTabelasVaziasCriticas();
    const problemasForeignKeys = await verificarForeignKeys();
    const problemasNaoUtilizadas = await verificarTabelasNaoUtilizadas();
    const problemasBackup = await verificarTabelasBackup();
    
    // Consolidar problemas
    todosProblemas.push(...problemasTabelasVazias);
    todosProblemas.push(...problemasForeignKeys);
    todosProblemas.push(...problemasNaoUtilizadas);
    todosProblemas.push(...problemasBackup);
    
    // Gerar relatório
    console.log('\n📋 GERANDO RELATÓRIO DE PROBLEMAS');
    console.log('=' .repeat(50));
    
    const { relatorio, caminhoArquivo } = gerarRelatorio(todosProblemas);
    const caminhoSQL = gerarScriptsCorrecao(todosProblemas);
    
    // Resumo final
    console.log('\n🎯 RESUMO FINAL');
    console.log('=' .repeat(50));
    console.log(`📊 Total de problemas encontrados: ${relatorio.total_problemas}`);
    console.log(`🔴 Problemas críticos/altos: ${relatorio.problemas_criticos}`);
    console.log(`🟡 Problemas médios: ${relatorio.problemas_medios}`);
    console.log('');
    console.log('📋 DETALHAMENTO:');
    console.log(`   - Tabelas vazias críticas: ${relatorio.resumo.tabelas_vazias_criticas}`);
    console.log(`   - Foreign keys faltando: ${relatorio.resumo.foreign_keys_faltando}`);
    console.log(`   - Tabelas sem uso no código: ${relatorio.resumo.tabelas_sem_uso}`);
    console.log(`   - Tabelas backup ativas: ${relatorio.resumo.tabelas_backup_ativas}`);
    console.log('');
    console.log('📄 ARQUIVOS GERADOS:');
    console.log(`   - Relatório JSON: ${caminhoArquivo}`);
    console.log(`   - Scripts SQL: ${caminhoSQL}`);
    
    // Recomendações
    console.log('\n🚀 PRÓXIMAS AÇÕES RECOMENDADAS');
    console.log('=' .repeat(50));
    
    if (relatorio.problemas_criticos > 0) {
      console.log('🔴 URGENTE - Resolver problemas críticos:');
      const criticos = todosProblemas.filter(p => p.impacto === 'CRÍTICO' || p.impacto === 'ALTO');
      criticos.forEach((problema, index) => {
        console.log(`   ${index + 1}. ${problema.descricao}`);
      });
    }
    
    if (relatorio.resumo.foreign_keys_faltando > 0) {
      console.log('\n🔗 Implementar foreign keys usando o arquivo SQL gerado');
    }
    
    if (relatorio.resumo.tabelas_vazias_criticas > 0) {
      console.log('\n🔍 Investigar por que tabelas críticas estão vazias');
    }
    
    console.log('\n✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = {
  verificarTabelasVaziasCriticas,
  verificarForeignKeys,
  verificarTabelasNaoUtilizadas,
  verificarTabelasBackup,
  main
};