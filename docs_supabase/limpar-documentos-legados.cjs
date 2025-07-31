#!/usr/bin/env node

/**
 * Script para Limpeza de Documentos Legados
 * 
 * Este script remove documentos obsoletos da pasta de documentação,
 * mantendo apenas aqueles que representam a realidade atual da aplicação.
 * 
 * Baseado na análise de ANALISE_DOCUMENTOS_LEGADOS.md
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configurações
const DOCS_DIR = path.join(__dirname, '01-documentacao');
const BACKUP_DIR = path.join(DOCS_DIR, 'backup-legados');
const LOG_FILE = path.join(__dirname, 'limpeza-documentos.log');

// Lista de documentos legados para remover (baseada na análise)
const DOCUMENTOS_LEGADOS = [
  // Esquemas Antigos
  'ESQUEMA_BANCO_DADOS_REAL.md',
  'ESQUEMA_REAL_2025-07-31.json',
  'ESQUEMA_REAL_DETALHADO_2025-07-31.json',
  
  // Documentação de Design Antiga
  'database-design-complete.md',
  'supabase-database-summary.md',
  'supabase-database-updated.md',
  
  // Análises Obsoletas
  'ANALISE_TABELAS_DOCUMENTADAS.md',
  'RESUMO_EXECUTIVO_ANALISE.md',
  'RESUMO_OTIMIZACAO_TABELAS.md',
  
  // Relatórios de Problemas Antigos
  'INCONSISTENCIAS_DOCUMENTACAO.md',
  'PLANO_CORRECAO_INCONSISTENCIAS.md',
  'relatorio-correcao.json',
  
  // Documentação de Produto (fora do escopo)
  'ESTRATEGIA-DESIGN-CONFIGURACOES-PRODUTO.md',
  'RELATORIO-SWITCHES-PRODUTO.md',
  'SWITCHES-PRODUTO-CONFIGURACAO.md',
  
  // Planos e Implementações Antigas
  'PLANO_IMPLEMENTACAO_OTIMIZADO.md',
  'MIGRATION_VIA_NPM.md',
  
  // Documentação Supabase Antiga
  'SUPABASE_DATABASE_DOCUMENTATION.md',
  'README-SUPABASE.md',
  
  // Guias e Validações Antigas
  'GUIA_EXECUCAO_MANUAL.md',
  'VALIDACAO_ANALISE_MCP.md',
  'DOCUMENTACAO_MUDANCAS_HOOKS.md'
];

// Lista de documentos atuais para manter (verificação de segurança)
const DOCUMENTOS_ATUAIS = [
  'DOCUMENTACAO_COMPLETA_2025-07-31.md',
  'DOCUMENTACAO_COMPLETA_2025-07-31.json',
  'RELATORIO_EXECUTIVO_2025-07-31.md',
  'STATUS_IMPLEMENTACAO_ATUAL.md',
  'TABELAS_REAIS_DESCOBERTAS.md',
  'SUPABASE_MCP_DEBUG_GUIDE.md',
  'SUPABASE_MIGRATION_GUIDE.md',
  'README.md',
  'ANALISE_DOCUMENTOS_LEGADOS.md'
];

/**
 * Função para criar log das operações
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage);
}

/**
 * Função para criar diretório de backup
 */
function criarDiretorioBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    log(`✅ Diretório de backup criado: ${BACKUP_DIR}`);
  } else {
    log(`ℹ️  Diretório de backup já existe: ${BACKUP_DIR}`);
  }
}

/**
 * Função para verificar se arquivo existe
 */
function arquivoExiste(arquivo) {
  const caminhoCompleto = path.join(DOCS_DIR, arquivo);
  return fs.existsSync(caminhoCompleto);
}

/**
 * Função para fazer backup de um arquivo
 */
function fazerBackup(arquivo) {
  const origem = path.join(DOCS_DIR, arquivo);
  const destino = path.join(BACKUP_DIR, arquivo);
  
  try {
    fs.copyFileSync(origem, destino);
    log(`📋 Backup criado: ${arquivo}`);
    return true;
  } catch (error) {
    log(`❌ Erro ao criar backup de ${arquivo}: ${error.message}`);
    return false;
  }
}

/**
 * Função para remover um arquivo
 */
function removerArquivo(arquivo) {
  const caminhoCompleto = path.join(DOCS_DIR, arquivo);
  
  try {
    fs.unlinkSync(caminhoCompleto);
    log(`🗑️  Arquivo removido: ${arquivo}`);
    return true;
  } catch (error) {
    log(`❌ Erro ao remover ${arquivo}: ${error.message}`);
    return false;
  }
}

/**
 * Função para listar arquivos no diretório
 */
function listarArquivos() {
  try {
    const arquivos = fs.readdirSync(DOCS_DIR)
      .filter(arquivo => fs.statSync(path.join(DOCS_DIR, arquivo)).isFile())
      .filter(arquivo => arquivo.endsWith('.md') || arquivo.endsWith('.json'));
    
    return arquivos;
  } catch (error) {
    log(`❌ Erro ao listar arquivos: ${error.message}`);
    return [];
  }
}

/**
 * Função para validar documentos atuais
 */
function validarDocumentosAtuais() {
  log('\n🔍 Validando documentos atuais...');
  
  const documentosFaltando = [];
  
  DOCUMENTOS_ATUAIS.forEach(doc => {
    if (!arquivoExiste(doc)) {
      documentosFaltando.push(doc);
    }
  });
  
  if (documentosFaltando.length > 0) {
    log(`⚠️  ATENÇÃO: Documentos atuais não encontrados:`);
    documentosFaltando.forEach(doc => log(`   - ${doc}`));
    return false;
  }
  
  log(`✅ Todos os ${DOCUMENTOS_ATUAIS.length} documentos atuais estão presentes`);
  return true;
}

/**
 * Função para gerar relatório de limpeza
 */
function gerarRelatorio(removidos, naoEncontrados, erros) {
  const relatorio = `
# 📊 RELATÓRIO DE LIMPEZA DE DOCUMENTOS

**Data:** ${new Date().toLocaleString('pt-BR')}
**Diretório:** ${DOCS_DIR}

## Resumo
- **Documentos para remover:** ${DOCUMENTOS_LEGADOS.length}
- **Documentos removidos:** ${removidos.length}
- **Documentos não encontrados:** ${naoEncontrados.length}
- **Erros:** ${erros.length}

## Documentos Removidos (${removidos.length})
${removidos.map(doc => `- ✅ ${doc}`).join('\n')}

## Documentos Não Encontrados (${naoEncontrados.length})
${naoEncontrados.map(doc => `- ⚠️  ${doc}`).join('\n')}

## Erros (${erros.length})
${erros.map(erro => `- ❌ ${erro}`).join('\n')}

## Documentos Mantidos
${DOCUMENTOS_ATUAIS.map(doc => `- 📄 ${doc}`).join('\n')}

---
*Relatório gerado automaticamente pelo script limpar-documentos-legados.js*
`;
  
  const arquivoRelatorio = path.join(__dirname, 'relatorio-limpeza-documentos.md');
  fs.writeFileSync(arquivoRelatorio, relatorio);
  log(`📋 Relatório salvo em: ${arquivoRelatorio}`);
}

/**
 * Função para confirmar ação com o usuário
 */
function confirmarAcao() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n⚠️  Deseja continuar com a remoção dos documentos legados? (s/N): ', (resposta) => {
      rl.close();
      resolve(resposta.toLowerCase() === 's' || resposta.toLowerCase() === 'sim');
    });
  });
}

/**
 * Função principal
 */
async function main() {
  console.clear();
  log('🧹 INICIANDO LIMPEZA DE DOCUMENTOS LEGADOS');
  log('==========================================\n');
  
  // Verificar se diretório existe
  if (!fs.existsSync(DOCS_DIR)) {
    log(`❌ Diretório não encontrado: ${DOCS_DIR}`);
    process.exit(1);
  }
  
  // Listar arquivos atuais
  const arquivosAtuais = listarArquivos();
  log(`📁 Encontrados ${arquivosAtuais.length} arquivos no diretório`);
  
  // Validar documentos atuais
  if (!validarDocumentosAtuais()) {
    log('\n❌ Validação falhou. Verifique os documentos atuais antes de continuar.');
    process.exit(1);
  }
  
  // Identificar documentos legados existentes
  const legadosExistentes = DOCUMENTOS_LEGADOS.filter(doc => arquivoExiste(doc));
  const legadosNaoEncontrados = DOCUMENTOS_LEGADOS.filter(doc => !arquivoExiste(doc));
  
  log(`\n📊 ANÁLISE:`);
  log(`   - Documentos legados para remover: ${DOCUMENTOS_LEGADOS.length}`);
  log(`   - Documentos legados encontrados: ${legadosExistentes.length}`);
  log(`   - Documentos legados não encontrados: ${legadosNaoEncontrados.length}`);
  log(`   - Documentos atuais para manter: ${DOCUMENTOS_ATUAIS.length}`);
  
  if (legadosExistentes.length === 0) {
    log('\n✅ Nenhum documento legado encontrado. Limpeza não necessária.');
    return;
  }
  
  log('\n📋 DOCUMENTOS LEGADOS ENCONTRADOS:');
  legadosExistentes.forEach(doc => log(`   - ${doc}`));
  
  if (legadosNaoEncontrados.length > 0) {
    log('\n⚠️  DOCUMENTOS LEGADOS NÃO ENCONTRADOS:');
    legadosNaoEncontrados.forEach(doc => log(`   - ${doc}`));
  }
  
  // Confirmar ação
  const confirmar = await confirmarAcao();
  if (!confirmar) {
    log('\n❌ Operação cancelada pelo usuário.');
    return;
  }
  
  // Criar diretório de backup
  criarDiretorioBackup();
  
  // Processar documentos legados
  log('\n🔄 INICIANDO PROCESSAMENTO...');
  
  const removidos = [];
  const erros = [];
  
  for (const documento of legadosExistentes) {
    log(`\n📄 Processando: ${documento}`);
    
    // Fazer backup
    if (fazerBackup(documento)) {
      // Remover arquivo original
      if (removerArquivo(documento)) {
        removidos.push(documento);
      } else {
        erros.push(`Falha ao remover ${documento}`);
      }
    } else {
      erros.push(`Falha ao fazer backup de ${documento}`);
    }
  }
  
  // Gerar relatório
  log('\n📋 GERANDO RELATÓRIO...');
  gerarRelatorio(removidos, legadosNaoEncontrados, erros);
  
  // Resumo final
  log('\n🎉 LIMPEZA CONCLUÍDA!');
  log('====================');
  log(`✅ Documentos removidos: ${removidos.length}`);
  log(`⚠️  Documentos não encontrados: ${legadosNaoEncontrados.length}`);
  log(`❌ Erros: ${erros.length}`);
  log(`📋 Backup salvo em: ${BACKUP_DIR}`);
  log(`📄 Log salvo em: ${LOG_FILE}`);
  
  if (erros.length > 0) {
    log('\n⚠️  ATENÇÃO: Alguns erros ocorreram durante o processo.');
    log('Verifique o log para mais detalhes.');
  } else {
    log('\n✅ Limpeza realizada com sucesso!');
    log('A documentação agora contém apenas arquivos atuais e precisos.');
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
  DOCUMENTOS_LEGADOS,
  DOCUMENTOS_ATUAIS,
  main
};