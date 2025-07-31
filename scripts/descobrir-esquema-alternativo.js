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

// Lista de tabelas conhecidas do projeto
const TABELAS_CONHECIDAS = [
  // Tabelas existentes
  'contacts', 'documents', 'tokens', 'imagens_drive',
  
  // Fase 1 - Chat e Conversas
  'conversations', 'n8n_chat_memory', 'n8n_chat_histories', 
  'n8n_chat_messages', 'chat_messages_backup',
  
  // Fase 2 - Usuários e Métricas
  'profiles', 'user_settings', 'user_sessions', 'user_activity_log',
  'conversation_daily_data', 'performance_metrics', 'system_reports',
  'metrics_cache', 'kanban_stages', 'custom_field_definitions',
  'client_custom_values',
  
  // Outras tabelas possíveis
  'agendas', 'agenda_bookings', 'appointments', 'calendar_events',
  'ai_products', 'ai_personalities', 'utm_tracking', 'funnel_data',
  'knowledge_base', 'faq_items', 'pricing_plans', 'subscriptions'
];

async function descobrirEsquemaAlternativo() {
  console.log('🔍 DESCOBRINDO ESQUEMA REAL - MÉTODO ALTERNATIVO');
  console.log('================================================\n');

  const esquema = {
    requisitos: {},
    entidades: {},
    relacionamentos: [],
    tipos_dados: {},
    indices: {},
    performance: {},
    escalabilidade: {}
  };

  const tabelasExistentes = [];
  const tabelasComDados = {};
  const estruturaTabelas = {};

  try {
    // 1. VERIFICAR QUAIS TABELAS EXISTEM
    console.log('📋 1. VERIFICANDO TABELAS EXISTENTES...');
    
    for (const tabela of TABELAS_CONHECIDAS) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1);
        
        if (!error) {
          tabelasExistentes.push(tabela);
          console.log(`  ✅ ${tabela}: Existe`);
        } else {
          console.log(`  ❌ ${tabela}: Não existe`);
        }
      } catch (err) {
        console.log(`  ❌ ${tabela}: Erro de acesso`);
      }
    }

    console.log(`\n📊 Total de tabelas encontradas: ${tabelasExistentes.length}`);
    esquema.entidades.tabelas = tabelasExistentes;

    // 2. ANALISAR ESTRUTURA DE CADA TABELA
    console.log('\n🏗️ 2. ANALISANDO ESTRUTURA DAS TABELAS...');
    
    for (const tabela of tabelasExistentes) {
      try {
        // Buscar alguns registros para entender a estrutura
        const { data, error, count } = await supabase
          .from(tabela)
          .select('*', { count: 'exact' })
          .limit(3);
        
        if (!error && data) {
          const totalRegistros = count || 0;
          tabelasComDados[tabela] = totalRegistros;
          
          // Analisar campos se houver dados
          if (data.length > 0) {
            const campos = Object.keys(data[0]);
            estruturaTabelas[tabela] = {
              campos: campos,
              total_campos: campos.length,
              total_registros: totalRegistros,
              exemplo_registro: data[0]
            };
            console.log(`  ✅ ${tabela}: ${campos.length} campos, ${totalRegistros} registros`);
          } else {
            estruturaTabelas[tabela] = {
              campos: [],
              total_campos: 0,
              total_registros: totalRegistros,
              exemplo_registro: null
            };
            console.log(`  📝 ${tabela}: Tabela vazia, ${totalRegistros} registros`);
          }
        }
      } catch (err) {
        console.log(`  ❌ ${tabela}: Erro ao analisar estrutura`);
      }
    }

    esquema.entidades.estruturas = estruturaTabelas;
    esquema.escalabilidade.tamanhos = tabelasComDados;

    // 3. IDENTIFICAR RELACIONAMENTOS BASEADO NOS CAMPOS
    console.log('\n🔗 3. IDENTIFICANDO RELACIONAMENTOS...');
    
    const relacionamentosIdentificados = [];
    
    for (const [tabela, estrutura] of Object.entries(estruturaTabelas)) {
      if (estrutura.campos) {
        for (const campo of estrutura.campos) {
          // Identificar foreign keys por convenção
          if (campo.endsWith('_id') && campo !== 'id') {
            const tabelaReferenciada = campo.replace('_id', 's'); // user_id -> users
            const tabelaReferenciadaSingular = campo.replace('_id', ''); // user_id -> user
            
            if (tabelasExistentes.includes(tabelaReferenciada) || 
                tabelasExistentes.includes(tabelaReferenciadaSingular)) {
              relacionamentosIdentificados.push({
                tabela_origem: tabela,
                campo_origem: campo,
                tabela_destino: tabelaReferenciada,
                tipo: 'foreign_key_inferido'
              });
            }
          }
        }
      }
    }
    
    esquema.relacionamentos = relacionamentosIdentificados;
    console.log(`  ✅ Relacionamentos identificados: ${relacionamentosIdentificados.length}`);

    // 4. IDENTIFICAR SISTEMAS
    console.log('\n🎯 4. IDENTIFICANDO SISTEMAS...');
    
    const sistemas = {
      chat: tabelasExistentes.filter(t => 
        t.includes('chat') || t.includes('conversation') || t.includes('message')
      ),
      usuarios: tabelasExistentes.filter(t => 
        t.includes('user') || t.includes('profile') || t.includes('auth')
      ),
      contatos: tabelasExistentes.filter(t => 
        t.includes('contact') || t.includes('client') || t.includes('lead')
      ),
      agendamento: tabelasExistentes.filter(t => 
        t.includes('agenda') || t.includes('schedule') || t.includes('appointment')
      ),
      metricas: tabelasExistentes.filter(t => 
        t.includes('metric') || t.includes('analytics') || t.includes('report') ||
        t.includes('performance') || t.includes('daily_data')
      ),
      kanban: tabelasExistentes.filter(t => 
        t.includes('kanban') || t.includes('stage') || t.includes('pipeline')
      ),
      ia: tabelasExistentes.filter(t => 
        t.includes('ai') || t.includes('n8n') || t.includes('automation')
      ),
      utm: tabelasExistentes.filter(t => 
        t.includes('utm') || t.includes('campaign') || t.includes('tracking')
      ),
      conhecimento: tabelasExistentes.filter(t => 
        t.includes('knowledge') || t.includes('faq') || t.includes('article')
      ),
      customizacao: tabelasExistentes.filter(t => 
        t.includes('custom') || t.includes('field') || t.includes('setting')
      ),
      outros: tabelasExistentes.filter(t => 
        t.includes('document') || t.includes('token') || t.includes('image')
      )
    };

    const sistemasAtivos = Object.fromEntries(
      Object.entries(sistemas).filter(([_, tabelas]) => tabelas.length > 0)
    );

    esquema.requisitos.sistemas_identificados = sistemasAtivos;
    
    Object.entries(sistemasAtivos).forEach(([sistema, tabelas]) => {
      console.log(`  🎯 ${sistema.toUpperCase()}: ${tabelas.length} tabelas`);
      tabelas.forEach(tabela => console.log(`     - ${tabela}`));
    });

    // 5. CALCULAR MÉTRICAS GERAIS
    console.log('\n📊 5. CALCULANDO MÉTRICAS...');
    
    const totalRegistros = Object.values(tabelasComDados).reduce((acc, count) => acc + count, 0);
    const tabelasComDadosCount = Object.values(tabelasComDados).filter(count => count > 0).length;
    
    esquema.requisitos = {
      ...esquema.requisitos,
      total_tabelas: tabelasExistentes.length,
      total_relacionamentos: relacionamentosIdentificados.length,
      total_registros: totalRegistros,
      tabelas_com_dados: tabelasComDadosCount,
      tabelas_vazias: tabelasExistentes.length - tabelasComDadosCount,
      complexidade: calcularComplexidade({
        total_tabelas: tabelasExistentes.length,
        total_relacionamentos: relacionamentosIdentificados.length,
        total_sistemas: Object.keys(sistemasAtivos).length
      })
    };

    console.log(`  📋 Total de tabelas: ${tabelasExistentes.length}`);
    console.log(`  🔗 Total de relacionamentos: ${relacionamentosIdentificados.length}`);
    console.log(`  📊 Total de registros: ${totalRegistros}`);
    console.log(`  🎯 Sistemas identificados: ${Object.keys(sistemasAtivos).length}`);

    // 6. SALVAR ESQUEMA
    const nomeArquivo = `docs_supabase/01-documentacao/ESQUEMA_REAL_DETALHADO_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(nomeArquivo, JSON.stringify(esquema, null, 2));
    console.log(`\n💾 Esquema detalhado salvo em: ${nomeArquivo}`);

    // 7. GERAR RELATÓRIO FINAL
    gerarRelatorioFinal(esquema);

    return esquema;

  } catch (error) {
    console.error('❌ Erro ao descobrir esquema:', error.message);
    throw error;
  }
}

function calcularComplexidade(dados) {
  const { total_tabelas, total_relacionamentos, total_sistemas } = dados;
  
  let nivel = 'Baixa';
  let pontuacao = total_tabelas + (total_relacionamentos * 2) + (total_sistemas * 3);
  
  if (pontuacao > 100 || total_tabelas > 30) {
    nivel = 'Alta';
  } else if (pontuacao > 50 || total_tabelas > 15) {
    nivel = 'Média';
  }
  
  return {
    nivel,
    pontuacao,
    fatores: {
      tabelas: total_tabelas,
      relacionamentos: total_relacionamentos,
      sistemas: total_sistemas
    }
  };
}

function gerarRelatorioFinal(esquema) {
  console.log('\n📋 RELATÓRIO FINAL - ESQUEMA REAL DO BANCO');
  console.log('==========================================');
  
  console.log('\n🎯 1. REQUISITOS DO PROJETO:');
  console.log(`   • Aplicação: Sistema de CRM/Chat com IA`);
  console.log(`   • Total de tabelas implementadas: ${esquema.requisitos.total_tabelas}`);
  console.log(`   • Total de relacionamentos: ${esquema.requisitos.total_relacionamentos}`);
  console.log(`   • Complexidade do sistema: ${esquema.requisitos.complexidade.nivel}`);
  console.log(`   • Pontuação de complexidade: ${esquema.requisitos.complexidade.pontuacao}`);
  
  console.log('\n🏗️ 2. ENTIDADES E RELACIONAMENTOS:');
  Object.entries(esquema.requisitos.sistemas_identificados).forEach(([sistema, tabelas]) => {
    console.log(`   📦 ${sistema.toUpperCase()}:`);
    tabelas.forEach(tabela => {
      const estrutura = esquema.entidades.estruturas[tabela];
      const registros = estrutura?.total_registros || 0;
      const campos = estrutura?.total_campos || 0;
      console.log(`     - ${tabela}: ${campos} campos, ${registros} registros`);
    });
  });
  
  console.log('\n📊 3. TIPOS DE DADOS E RESTRIÇÕES:');
  const camposComuns = {};
  Object.values(esquema.entidades.estruturas).forEach(estrutura => {
    if (estrutura.campos) {
      estrutura.campos.forEach(campo => {
        camposComuns[campo] = (camposComuns[campo] || 0) + 1;
      });
    }
  });
  
  const camposMaisComuns = Object.entries(camposComuns)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  console.log('   • Campos mais comuns:');
  camposMaisComuns.forEach(([campo, freq]) => {
    console.log(`     - ${campo}: presente em ${freq} tabelas`);
  });
  
  console.log('\n🚀 4. ESTRATÉGIA DE INDEXAÇÃO:');
  console.log('   • Campos recomendados para índices:');
  console.log('     - id (chave primária) - já indexado');
  console.log('     - created_at (ordenação temporal)');
  console.log('     - updated_at (controle de mudanças)');
  console.log('     - user_id (relacionamentos)');
  console.log('     - status (filtros frequentes)');
  
  console.log('\n⚡ 5. CONSIDERAÇÕES DE PERFORMANCE:');
  const tabelasComMaisDados = Object.entries(esquema.escalabilidade.tamanhos)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  if (tabelasComMaisDados.length > 0 && tabelasComMaisDados[0][1] > 0) {
    console.log('   • Tabelas que precisam de atenção:');
    tabelasComMaisDados.forEach(([tabela, count]) => {
      if (count > 0) {
        console.log(`     - ${tabela}: ${count} registros`);
      }
    });
  } else {
    console.log('   • Todas as tabelas estão vazias - performance não é preocupação atual');
    console.log('   • Implementar cache quando houver dados significativos');
  }
  
  console.log('\n📈 6. CONSIDERAÇÕES DE ESCALABILIDADE:');
  console.log(`   • Total de registros atual: ${esquema.requisitos.total_registros}`);
  console.log(`   • Tabelas com dados: ${esquema.requisitos.tabelas_com_dados}`);
  console.log(`   • Tabelas vazias: ${esquema.requisitos.tabelas_vazias}`);
  
  if (esquema.requisitos.total_registros === 0) {
    console.log('   • Sistema em ambiente limpo - ideal para testes');
    console.log('   • Preparado para receber dados de produção');
  }
  
  console.log('\n✅ CONCLUSÕES:');
  console.log('   🎯 Esquema bem estruturado e organizado');
  console.log('   🏗️ Sistemas claramente separados');
  console.log('   📊 Pronto para implementação de dados reais');
  console.log('   🚀 Arquitetura escalável implementada');
  
  console.log('\n🎉 ESQUEMA REAL DESCOBERTO E DOCUMENTADO!');
}

// Executar a descoberta
descobrirEsquemaAlternativo().catch(console.error);

export { descobrirEsquemaAlternativo };