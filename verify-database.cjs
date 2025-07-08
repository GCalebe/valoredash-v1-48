const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyDatabase() {
  console.log('🔍 Verificando dados no banco de dados...');
  console.log('=' .repeat(50));

  try {
    // Verificar tabelas principais
    const tables = [
      'contacts',
      'client_stats', 
      'monthly_growth',
      'conversation_metrics',
      'funnel_data',
      'conversion_by_time',
      'leads_by_source',
      'leads_over_time',
      'utm_metrics',
      'campaign_data',
      'utm_tracking',
      'ai_products',
      'custom_fields',
      'custom_field_validation_rules',
      'client_custom_values',
      'custom_field_audit_log',
      'chat_messages',
      'ai_stages',
      'ai_personality_settings'
    ];

    const results = {};
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          results[table] = { status: 'ERROR', error: error.message };
        } else {
          results[table] = { status: 'OK', count: count || 0 };
        }
      } catch (err) {
        results[table] = { status: 'ERROR', error: err.message };
      }
    }

    // Exibir resultados
    console.log('📊 RELATÓRIO DO BANCO DE DADOS');
    console.log('=' .repeat(50));
    
    let totalRecords = 0;
    let successfulTables = 0;
    let errorTables = 0;

    Object.entries(results).forEach(([table, result]) => {
      const status = result.status === 'OK' ? '✅' : '❌';
      const count = result.count || 0;
      const info = result.status === 'OK' ? `${count} registros` : result.error;
      
      console.log(`${status} ${table.padEnd(25)} | ${info}`);
      
      if (result.status === 'OK') {
        totalRecords += count;
        successfulTables++;
      } else {
        errorTables++;
      }
    });

    console.log('=' .repeat(50));
    console.log(`📈 RESUMO GERAL:`);
    console.log(`   Tabelas com sucesso: ${successfulTables}`);
    console.log(`   Tabelas com erro: ${errorTables}`);
    console.log(`   Total de registros: ${totalRecords}`);
    
    // Verificações específicas para métricas
    console.log('\n🎯 VERIFICAÇÕES ESPECÍFICAS:');
    console.log('=' .repeat(50));
    
    // Verificar se há dados suficientes para dashboard
    const dashboardChecks = [
      { table: 'contacts', min: 10, description: 'Contatos para análise' },
      { table: 'client_stats', min: 20, description: 'Estatísticas de clientes' },
      { table: 'conversation_metrics', min: 20, description: 'Métricas de conversação' },
      { table: 'funnel_data', min: 100, description: 'Dados do funil de vendas' },
      { table: 'utm_tracking', min: 15, description: 'Dados de UTM tracking' },
      { table: 'ai_stages', min: 3, description: 'Estágios de IA' },
      { table: 'ai_personality_settings', min: 2, description: 'Personalidades de IA' }
    ];

    let dashboardReady = true;
    
    for (const check of dashboardChecks) {
      const result = results[check.table];
      const count = result?.count || 0;
      const hasEnough = count >= check.min;
      const status = hasEnough ? '✅' : '⚠️';
      
      console.log(`${status} ${check.description.padEnd(30)} | ${count}/${check.min}`);
      
      if (!hasEnough) {
        dashboardReady = false;
      }
    }

    console.log('=' .repeat(50));
    
    if (dashboardReady) {
      console.log('🎉 BANCO DE DADOS PRONTO PARA O DASHBOARD!');
      console.log('   Todos os dados necessários foram inseridos com sucesso.');
      console.log('   A aplicação deve conseguir exibir todas as métricas corretamente.');
    } else {
      console.log('⚠️  ATENÇÃO: Algumas tabelas podem não ter dados suficientes.');
      console.log('   Verifique os itens marcados com ⚠️  acima.');
    }

    // Verificar consistência de dados
    console.log('\n🔗 VERIFICAÇÃO DE CONSISTÊNCIA:');
    console.log('=' .repeat(50));
    
    // Verificar se há contatos com dados relacionados
    const { data: contactsWithStats } = await supabase
      .from('contacts')
      .select(`
        id,
        client_stats(id),
        conversation_metrics(id)
      `)
      .limit(5);

    if (contactsWithStats && contactsWithStats.length > 0) {
      const hasStats = contactsWithStats.some(c => c.client_stats?.length > 0);
      const hasConversations = contactsWithStats.some(c => c.conversation_metrics?.length > 0);
      
      console.log(`✅ Relacionamentos entre tabelas: ${hasStats && hasConversations ? 'OK' : 'Verificar'}`);
    }

    console.log('\n🏁 Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
  }
}

verifyDatabase();