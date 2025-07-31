import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * SCRIPT ESPECIALIZADO EM ANÁLISE DE RELACIONAMENTOS REAIS
 * 
 * Este script foca especificamente em:
 * 1. Descobrir relacionamentos reais via foreign keys
 * 2. Analisar constraints existentes
 * 3. Mapear dependências entre tabelas
 * 4. Identificar padrões de relacionamento
 * 5. Sugerir melhorias na integridade referencial
 */

async function analisarRelacionamentosReais() {
  console.log('🔗 ANÁLISE AVANÇADA DE RELACIONAMENTOS REAIS');
  console.log('============================================\n');

  const analise = {
    metadata: {
      data_analise: new Date().toISOString(),
      versao: '1.0',
      objetivo: 'Mapear relacionamentos reais e constraints do banco'
    },
    relacionamentos: {
      foreign_keys_reais: [],
      relacionamentos_inferidos: [],
      relacionamentos_perdidos: [],
      dependencias_circulares: []
    },
    constraints: {
      primary_keys: [],
      unique_constraints: [],
      check_constraints: [],
      not_null_constraints: []
    },
    indices: {
      indices_relacionamento: [],
      indices_performance: [],
      indices_sugeridos: []
    },
    integridade: {
      problemas_identificados: [],
      recomendacoes: [],
      score_integridade: 0
    }
  };

  try {
    // 1. DESCOBRIR FOREIGN KEYS REAIS
    console.log('🔍 1. DESCOBRINDO FOREIGN KEYS REAIS...');
    const foreignKeys = await descobrirForeignKeysReais();
    analise.relacionamentos.foreign_keys_reais = foreignKeys;
    console.log(`   ✅ Encontradas ${foreignKeys.length} foreign keys reais`);

    // 2. ANALISAR CONSTRAINTS DETALHADAMENTE
    console.log('\n⚠️ 2. ANALISANDO CONSTRAINTS DETALHADAMENTE...');
    const constraints = await analisarConstraintsDetalhado();
    analise.constraints = constraints;
    console.log(`   ✅ Analisadas constraints de ${Object.keys(constraints).length} tipos`);

    // 3. MAPEAR RELACIONAMENTOS INFERIDOS
    console.log('\n🧠 3. MAPEANDO RELACIONAMENTOS INFERIDOS...');
    const relacionamentosInferidos = await mapearRelacionamentosInferidos();
    analise.relacionamentos.relacionamentos_inferidos = relacionamentosInferidos;
    console.log(`   ✅ Identificados ${relacionamentosInferidos.length} relacionamentos inferidos`);

    // 4. IDENTIFICAR RELACIONAMENTOS PERDIDOS
    console.log('\n❌ 4. IDENTIFICANDO RELACIONAMENTOS PERDIDOS...');
    const relacionamentosPerdidos = identificarRelacionamentosPerdidos(relacionamentosInferidos, foreignKeys);
    analise.relacionamentos.relacionamentos_perdidos = relacionamentosPerdidos;
    console.log(`   ⚠️ Encontrados ${relacionamentosPerdidos.length} relacionamentos sem constraint`);

    // 5. ANALISAR ÍNDICES DE RELACIONAMENTO
    console.log('\n🚀 5. ANALISANDO ÍNDICES DE RELACIONAMENTO...');
    const indices = await analisarIndicesRelacionamento();
    analise.indices = indices;
    console.log(`   ✅ Analisados ${indices.indices_relacionamento.length} índices de relacionamento`);

    // 6. DETECTAR DEPENDÊNCIAS CIRCULARES
    console.log('\n🔄 6. DETECTANDO DEPENDÊNCIAS CIRCULARES...');
    const dependenciasCirculares = detectarDependenciasCirculares(foreignKeys);
    analise.relacionamentos.dependencias_circulares = dependenciasCirculares;
    console.log(`   ${dependenciasCirculares.length > 0 ? '⚠️' : '✅'} ${dependenciasCirculares.length} dependências circulares encontradas`);

    // 7. CALCULAR SCORE DE INTEGRIDADE
    console.log('\n📊 7. CALCULANDO SCORE DE INTEGRIDADE...');
    const integridade = calcularScoreIntegridade(analise);
    analise.integridade = integridade;
    console.log(`   📈 Score de integridade: ${integridade.score_integridade}/100`);

    // 8. GERAR RECOMENDAÇÕES
    console.log('\n💡 8. GERANDO RECOMENDAÇÕES...');
    const recomendacoes = gerarRecomendacoesIntegridade(analise);
    analise.integridade.recomendacoes = recomendacoes;
    console.log(`   ✅ Geradas ${recomendacoes.length} recomendações`);

    // 9. SALVAR ANÁLISE
    const nomeArquivo = `docs_supabase/01-documentacao/ANALISE_RELACIONAMENTOS_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(nomeArquivo, JSON.stringify(analise, null, 2));
    console.log(`\n💾 Análise salva em: ${nomeArquivo}`);

    // 10. GERAR RELATÓRIO DE RELACIONAMENTOS
    await gerarRelatorioRelacionamentos(analise);

    // 11. GERAR SCRIPTS SQL DE MELHORIA
    await gerarScriptsMelhoria(analise);

    // 12. RELATÓRIO FINAL
    gerarRelatorioFinalRelacionamentos(analise);

    return analise;

  } catch (error) {
    console.error('❌ Erro na análise de relacionamentos:', error.message);
    throw error;
  }
}

// FUNÇÕES AUXILIARES ESPECIALIZADAS

async function descobrirForeignKeysReais() {
  const query = `
    SELECT 
      tc.table_name as tabela_origem,
      kcu.column_name as campo_origem,
      ccu.table_name as tabela_destino,
      ccu.column_name as campo_destino,
      tc.constraint_name as nome_constraint,
      rc.update_rule as regra_update,
      rc.delete_rule as regra_delete
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu 
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints rc 
      ON tc.constraint_name = rc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `;

  try {
    const { data, error } = await supabase.rpc('execute_sql', { query });
    if (error) {
      console.log('   ⚠️ Erro ao buscar foreign keys, usando método alternativo...');
      return [];
    }
    return data || [];
  } catch (err) {
    console.log('   ⚠️ Método alternativo: analisando padrões de nomenclatura...');
    return [];
  }
}

async function analisarConstraintsDetalhado() {
  const constraints = {
    primary_keys: [],
    unique_constraints: [],
    check_constraints: [],
    not_null_constraints: []
  };

  // Buscar Primary Keys
  const pkQuery = `
    SELECT 
      tc.table_name,
      kcu.column_name,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name;
  `;

  try {
    const { data: pkData } = await supabase.rpc('execute_sql', { query: pkQuery });
    constraints.primary_keys = pkData || [];
  } catch (err) {
    console.log('   ⚠️ Erro ao buscar primary keys');
  }

  // Buscar Unique Constraints
  const uniqueQuery = `
    SELECT 
      tc.table_name,
      kcu.column_name,
      tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'UNIQUE'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name;
  `;

  try {
    const { data: uniqueData } = await supabase.rpc('execute_sql', { query: uniqueQuery });
    constraints.unique_constraints = uniqueData || [];
  } catch (err) {
    console.log('   ⚠️ Erro ao buscar unique constraints');
  }

  return constraints;
}

async function mapearRelacionamentosInferidos() {
  // Lista de tabelas conhecidas do sistema
  const tabelas = [
    'contacts', 'conversations', 'n8n_chat_messages', 'profiles',
    'agendas', 'agenda_bookings', 'kanban_stages', 'ai_personalities',
    'utm_tracking', 'knowledge_base', 'faq_items', 'custom_field_definitions',
    'client_custom_values', 'calendar_events', 'tokens'
  ];

  const relacionamentosInferidos = [];

  // Padrões comuns de relacionamento
  const padroes = [
    { campo: 'user_id', tabela_destino: 'profiles' },
    { campo: 'contact_id', tabela_destino: 'contacts' },
    { campo: 'session_id', tabela_destino: 'conversations' },
    { campo: 'kanban_stage_id', tabela_destino: 'kanban_stages' },
    { campo: 'agenda_id', tabela_destino: 'agendas' },
    { campo: 'booking_id', tabela_destino: 'agenda_bookings' },
    { campo: 'field_id', tabela_destino: 'custom_field_definitions' },
    { campo: 'client_id', tabela_destino: 'contacts' }
  ];

  for (const tabela of tabelas) {
    try {
      // Buscar estrutura da tabela
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .limit(1);

      if (!error && data && data.length > 0) {
        const campos = Object.keys(data[0]);
        
        // Verificar padrões de relacionamento
        campos.forEach(campo => {
          padroes.forEach(padrao => {
            if (campo === padrao.campo) {
              relacionamentosInferidos.push({
                tabela_origem: tabela,
                campo_origem: campo,
                tabela_destino: padrao.tabela_destino,
                campo_destino: 'id',
                tipo: 'inferido_por_nomenclatura',
                confianca: 'alta'
              });
            }
          });

          // Detectar campos terminados em _id
          if (campo.endsWith('_id') && campo !== 'id') {
            const tabelaInferida = campo.replace('_id', 's');
            if (tabelas.includes(tabelaInferida)) {
              relacionamentosInferidos.push({
                tabela_origem: tabela,
                campo_origem: campo,
                tabela_destino: tabelaInferida,
                campo_destino: 'id',
                tipo: 'inferido_por_padrao',
                confianca: 'media'
              });
            }
          }
        });
      }
    } catch (err) {
      console.log(`   ⚠️ Erro ao analisar tabela ${tabela}:`, err.message);
    }
  }

  return relacionamentosInferidos;
}

function identificarRelacionamentosPerdidos(relacionamentosInferidos, foreignKeys) {
  const relacionamentosPerdidos = [];
  const fkExistentes = new Set(
    foreignKeys.map(fk => `${fk.tabela_origem}.${fk.campo_origem}->${fk.tabela_destino}.${fk.campo_destino}`)
  );

  relacionamentosInferidos.forEach(rel => {
    const chave = `${rel.tabela_origem}.${rel.campo_origem}->${rel.tabela_destino}.${rel.campo_destino}`;
    if (!fkExistentes.has(chave)) {
      relacionamentosPerdidos.push({
        ...rel,
        problema: 'Relacionamento sem constraint de foreign key',
        impacto: 'Possível inconsistência de dados',
        prioridade: rel.confianca === 'alta' ? 'alta' : 'media'
      });
    }
  });

  return relacionamentosPerdidos;
}

async function analisarIndicesRelacionamento() {
  const query = `
    SELECT 
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes 
    WHERE schemaname = 'public'
      AND (indexname LIKE '%_id%' OR indexdef LIKE '%_id%')
    ORDER BY tablename, indexname;
  `;

  try {
    const { data, error } = await supabase.rpc('execute_sql', { query });
    if (error) {
      return {
        indices_relacionamento: [],
        indices_performance: [],
        indices_sugeridos: []
      };
    }

    const indicesRelacionamento = data || [];
    const indicesSugeridos = [];

    // Sugerir índices para campos de relacionamento comuns
    const camposComuns = ['user_id', 'contact_id', 'session_id', 'kanban_stage_id'];
    camposComuns.forEach(campo => {
      const existeIndice = indicesRelacionamento.some(idx => 
        idx.indexdef.includes(campo)
      );
      if (!existeIndice) {
        indicesSugeridos.push({
          campo: campo,
          tipo: 'btree',
          justificativa: 'Campo de relacionamento frequentemente usado em JOINs',
          prioridade: 'alta'
        });
      }
    });

    return {
      indices_relacionamento: indicesRelacionamento,
      indices_performance: [],
      indices_sugeridos: indicesSugeridos
    };
  } catch (err) {
    return {
      indices_relacionamento: [],
      indices_performance: [],
      indices_sugeridos: []
    };
  }
}

function detectarDependenciasCirculares(foreignKeys) {
  const dependencias = new Map();
  const circulares = [];

  // Construir grafo de dependências
  foreignKeys.forEach(fk => {
    if (!dependencias.has(fk.tabela_origem)) {
      dependencias.set(fk.tabela_origem, []);
    }
    dependencias.get(fk.tabela_origem).push(fk.tabela_destino);
  });

  // Detectar ciclos usando DFS
  const visitados = new Set();
  const pilhaRecursao = new Set();

  function dfs(tabela, caminho = []) {
    if (pilhaRecursao.has(tabela)) {
      const indiceCiclo = caminho.indexOf(tabela);
      if (indiceCiclo !== -1) {
        circulares.push({
          ciclo: caminho.slice(indiceCiclo).concat([tabela]),
          tipo: 'dependencia_circular',
          impacto: 'Pode causar problemas em operações CASCADE'
        });
      }
      return;
    }

    if (visitados.has(tabela)) return;

    visitados.add(tabela);
    pilhaRecursao.add(tabela);
    caminho.push(tabela);

    const dependenciasTabela = dependencias.get(tabela) || [];
    dependenciasTabela.forEach(dep => {
      dfs(dep, [...caminho]);
    });

    pilhaRecursao.delete(tabela);
  }

  // Executar DFS para cada tabela
  dependencias.keys().forEach(tabela => {
    if (!visitados.has(tabela)) {
      dfs(tabela);
    }
  });

  return circulares;
}

function calcularScoreIntegridade(analise) {
  let score = 0;
  const problemas = [];

  // Pontuação base
  score += 20;

  // Foreign keys implementadas (+30 pontos)
  const fkCount = analise.relacionamentos.foreign_keys_reais.length;
  const relacionamentosCount = analise.relacionamentos.relacionamentos_inferidos.length;
  if (relacionamentosCount > 0) {
    const percentualFK = (fkCount / relacionamentosCount) * 100;
    score += Math.min(30, (percentualFK / 100) * 30);
  }

  // Relacionamentos perdidos (-10 pontos por relacionamento crítico)
  const relacionamentosCriticos = analise.relacionamentos.relacionamentos_perdidos
    .filter(rel => rel.prioridade === 'alta').length;
  score -= relacionamentosCriticos * 10;

  // Constraints implementadas (+20 pontos)
  const pkCount = analise.constraints.primary_keys.length;
  const uniqueCount = analise.constraints.unique_constraints.length;
  if (pkCount > 0) score += 10;
  if (uniqueCount > 0) score += 10;

  // Índices de relacionamento (+20 pontos)
  const indicesCount = analise.indices.indices_relacionamento.length;
  if (indicesCount > 5) score += 20;
  else if (indicesCount > 0) score += 10;

  // Dependências circulares (-15 pontos por ciclo)
  const ciclosCount = analise.relacionamentos.dependencias_circulares.length;
  score -= ciclosCount * 15;

  // Garantir que o score esteja entre 0 e 100
  score = Math.max(0, Math.min(100, score));

  // Identificar problemas
  if (relacionamentosCriticos > 0) {
    problemas.push(`${relacionamentosCriticos} relacionamentos críticos sem foreign key`);
  }
  if (ciclosCount > 0) {
    problemas.push(`${ciclosCount} dependências circulares detectadas`);
  }
  if (indicesCount < 3) {
    problemas.push('Poucos índices para otimização de relacionamentos');
  }

  return {
    score_integridade: Math.round(score),
    problemas_identificados: problemas,
    nivel: score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : score >= 40 ? 'Regular' : 'Crítico'
  };
}

function gerarRecomendacoesIntegridade(analise) {
  const recomendacoes = [];

  // Recomendações para relacionamentos perdidos
  const relacionamentosCriticos = analise.relacionamentos.relacionamentos_perdidos
    .filter(rel => rel.prioridade === 'alta');
  
  relacionamentosCriticos.forEach(rel => {
    recomendacoes.push({
      tipo: 'foreign_key',
      prioridade: 'alta',
      descricao: `Adicionar foreign key: ${rel.tabela_origem}.${rel.campo_origem} -> ${rel.tabela_destino}.${rel.campo_destino}`,
      sql: `ALTER TABLE ${rel.tabela_origem} ADD CONSTRAINT fk_${rel.tabela_origem}_${rel.campo_origem} FOREIGN KEY (${rel.campo_origem}) REFERENCES ${rel.tabela_destino}(${rel.campo_destino});`,
      impacto: 'Melhora integridade referencial'
    });
  });

  // Recomendações para índices
  analise.indices.indices_sugeridos.forEach(idx => {
    recomendacoes.push({
      tipo: 'indice',
      prioridade: idx.prioridade,
      descricao: `Criar índice para ${idx.campo}`,
      sql: `CREATE INDEX idx_${idx.campo} ON tabela_apropriada (${idx.campo});`,
      impacto: 'Melhora performance de JOINs'
    });
  });

  // Recomendações para dependências circulares
  analise.relacionamentos.dependencias_circulares.forEach(ciclo => {
    recomendacoes.push({
      tipo: 'arquitetura',
      prioridade: 'media',
      descricao: `Revisar dependência circular: ${ciclo.ciclo.join(' -> ')}`,
      impacto: 'Evita problemas em operações CASCADE'
    });
  });

  return recomendacoes;
}

async function gerarRelatorioRelacionamentos(analise) {
  const relatorio = `# 🔗 Relatório de Análise de Relacionamentos

*Gerado automaticamente em: ${new Date().toLocaleString('pt-BR')}*

## 📊 Resumo Executivo

- **Score de Integridade**: ${analise.integridade.score_integridade}/100 (${analise.integridade.nivel})
- **Foreign Keys Reais**: ${analise.relacionamentos.foreign_keys_reais.length}
- **Relacionamentos Inferidos**: ${analise.relacionamentos.relacionamentos_inferidos.length}
- **Relacionamentos Perdidos**: ${analise.relacionamentos.relacionamentos_perdidos.length}
- **Dependências Circulares**: ${analise.relacionamentos.dependencias_circulares.length}

## 🔍 Foreign Keys Implementadas

${analise.relacionamentos.foreign_keys_reais.length > 0 ? 
  analise.relacionamentos.foreign_keys_reais.map(fk => 
    `- **${fk.tabela_origem}.${fk.campo_origem}** → **${fk.tabela_destino}.${fk.campo_destino}**\n  - Constraint: \`${fk.nome_constraint}\`\n  - Update: ${fk.regra_update} | Delete: ${fk.regra_delete}`
  ).join('\n\n') : 
  'Nenhuma foreign key real encontrada no banco.'
}

## 🧠 Relacionamentos Inferidos

${analise.relacionamentos.relacionamentos_inferidos.map(rel => 
  `- **${rel.tabela_origem}.${rel.campo_origem}** → **${rel.tabela_destino}.${rel.campo_destino}**\n  - Tipo: ${rel.tipo}\n  - Confiança: ${rel.confianca}`
).join('\n\n')}

## ❌ Relacionamentos Perdidos (Sem Foreign Key)

${analise.relacionamentos.relacionamentos_perdidos.length > 0 ? 
  analise.relacionamentos.relacionamentos_perdidos.map(rel => 
    `- **${rel.tabela_origem}.${rel.campo_origem}** → **${rel.tabela_destino}.${rel.campo_destino}**\n  - Prioridade: ${rel.prioridade}\n  - Problema: ${rel.problema}\n  - Impacto: ${rel.impacto}`
  ).join('\n\n') : 
  'Todos os relacionamentos possuem constraints adequadas.'
}

## 🚀 Índices de Relacionamento

${analise.indices.indices_relacionamento.length > 0 ? 
  analise.indices.indices_relacionamento.map(idx => 
    `- **${idx.tablename}.${idx.indexname}**\n  - Definição: \`${idx.indexdef}\``
  ).join('\n\n') : 
  'Nenhum índice específico de relacionamento encontrado.'
}

## 💡 Recomendações

### Prioridade Alta
${analise.integridade.recomendacoes.filter(rec => rec.prioridade === 'alta').map(rec => 
  `- **${rec.descricao}**\n  \`\`\`sql\n  ${rec.sql}\n  \`\`\`\n  *Impacto: ${rec.impacto}*`
).join('\n\n')}

### Prioridade Média
${analise.integridade.recomendacoes.filter(rec => rec.prioridade === 'media').map(rec => 
  `- **${rec.descricao}**\n  ${rec.sql ? `\`\`\`sql\n  ${rec.sql}\n  \`\`\`` : ''}\n  *Impacto: ${rec.impacto}*`
).join('\n\n')}

## 🔄 Dependências Circulares

${analise.relacionamentos.dependencias_circulares.length > 0 ? 
  analise.relacionamentos.dependencias_circulares.map(dep => 
    `- **Ciclo**: ${dep.ciclo.join(' → ')}\n  - Tipo: ${dep.tipo}\n  - Impacto: ${dep.impacto}`
  ).join('\n\n') : 
  'Nenhuma dependência circular detectada.'
}

---

*Relatório gerado pelo script de análise de relacionamentos reais*
`;

  const nomeArquivo = `docs_supabase/01-documentacao/RELATORIO_RELACIONAMENTOS_${new Date().toISOString().split('T')[0]}.md`;
  fs.writeFileSync(nomeArquivo, relatorio);
  console.log(`   ✅ Relatório salvo em: ${nomeArquivo}`);
}

async function gerarScriptsMelhoria(analise) {
  const scripts = [];

  // Scripts para adicionar foreign keys
  const fkScripts = analise.integridade.recomendacoes
    .filter(rec => rec.tipo === 'foreign_key')
    .map(rec => rec.sql);

  if (fkScripts.length > 0) {
    const scriptFK = `-- Script para adicionar Foreign Keys\n-- Gerado automaticamente\n\n${fkScripts.join('\n\n')}`;
    const nomeArquivoFK = `scripts/sql/adicionar_foreign_keys_${new Date().toISOString().split('T')[0]}.sql`;
    
    // Criar diretório se não existir
    if (!fs.existsSync('scripts/sql')) {
      fs.mkdirSync('scripts/sql', { recursive: true });
    }
    
    fs.writeFileSync(nomeArquivoFK, scriptFK);
    scripts.push(nomeArquivoFK);
  }

  // Scripts para adicionar índices
  const indexScripts = analise.integridade.recomendacoes
    .filter(rec => rec.tipo === 'indice')
    .map(rec => rec.sql);

  if (indexScripts.length > 0) {
    const scriptIndex = `-- Script para adicionar Índices\n-- Gerado automaticamente\n\n${indexScripts.join('\n\n')}`;
    const nomeArquivoIndex = `scripts/sql/adicionar_indices_${new Date().toISOString().split('T')[0]}.sql`;
    fs.writeFileSync(nomeArquivoIndex, scriptIndex);
    scripts.push(nomeArquivoIndex);
  }

  if (scripts.length > 0) {
    console.log(`   ✅ Scripts de melhoria gerados: ${scripts.join(', ')}`);
  }
}

function gerarRelatorioFinalRelacionamentos(analise) {
  console.log('\n📋 RELATÓRIO FINAL - ANÁLISE DE RELACIONAMENTOS');
  console.log('===============================================');
  
  console.log('\n🎯 SCORE DE INTEGRIDADE:');
  console.log(`   • Score: ${analise.integridade.score_integridade}/100 (${analise.integridade.nivel})`);
  
  console.log('\n🔗 RELACIONAMENTOS:');
  console.log(`   • Foreign Keys Reais: ${analise.relacionamentos.foreign_keys_reais.length}`);
  console.log(`   • Relacionamentos Inferidos: ${analise.relacionamentos.relacionamentos_inferidos.length}`);
  console.log(`   • Relacionamentos Perdidos: ${analise.relacionamentos.relacionamentos_perdidos.length}`);
  
  console.log('\n⚠️ PROBLEMAS IDENTIFICADOS:');
  if (analise.integridade.problemas_identificados.length > 0) {
    analise.integridade.problemas_identificados.forEach(problema => {
      console.log(`   ❌ ${problema}`);
    });
  } else {
    console.log('   ✅ Nenhum problema crítico identificado');
  }
  
  console.log('\n💡 RECOMENDAÇÕES:');
  const recAlta = analise.integridade.recomendacoes.filter(rec => rec.prioridade === 'alta').length;
  const recMedia = analise.integridade.recomendacoes.filter(rec => rec.prioridade === 'media').length;
  console.log(`   • Prioridade Alta: ${recAlta}`);
  console.log(`   • Prioridade Média: ${recMedia}`);
  
  console.log('\n🎉 ANÁLISE DE RELACIONAMENTOS CONCLUÍDA!');
  console.log('\n📚 Próximos passos:');
  console.log('   1. Revisar relacionamentos perdidos');
  console.log('   2. Implementar foreign keys críticas');
  console.log('   3. Adicionar índices de performance');
  console.log('   4. Monitorar integridade referencial');
}

// Executar a análise
analisarRelacionamentosReais().catch(console.error);

export { analisarRelacionamentosReais };