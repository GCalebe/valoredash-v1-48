// Script otimizado para execução direta - Popular banco com dados realistas
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utilitários
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function randomDate(start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

console.log('🚀 INICIANDO EXECUÇÃO DO SEEDING ABRANGENTE');
console.log('=' .repeat(60));

// Executar seeding imediatamente
(async () => {
  try {
    // 1. Verificar conexão
    console.log('🔍 Verificando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('contacts')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError.message);
      return;
    }
    console.log('✅ Conexão estabelecida com sucesso');

    // 2. Popular contacts (50 registros para teste rápido)
    console.log('\n👥 Populando contatos...');
    const contacts = [];
    const names = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Souza'];
    const companies = ['Tech Solutions', 'Digital Pro', 'Inovação Ltda', 'Consultoria Plus'];
    const clientTypes = ['Pessoa Física', 'MEI', 'ME', 'EPP'];
    const stages = ['Lead', 'Qualificado', 'Reunião Agendada', 'Proposta Enviada', 'Fechado'];

    for (let i = 0; i < 50; i++) {
      const createdAt = randomDate();
      const stage = randomChoice(stages);
      const sales = stage === 'Fechado' ? randomInt(2000, 15000) : 0;
      
      contacts.push({
        id: uuidv4(),
        name: `${randomChoice(names)} ${i + 1}`,
        client_name: randomChoice(companies),
        email: `cliente${i + 1}@email.com`,
        phone: `(11) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
        client_type: randomChoice(clientTypes),
        kanban_stage: stage,
        sales: sales,
        session_id: `session_${i + 1}`,
        created_at: createdAt.toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    const { error: contactsError } = await supabase.from('contacts').insert(contacts);
    if (contactsError) {
      console.error('Erro ao inserir contatos:', contactsError.message);
    } else {
      console.log(`✅ ${contacts.length} contatos inseridos com sucesso`);
    }

    // 3. Popular conversation_metrics
    console.log('\n💬 Populando métricas de conversação...');
    const metrics = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const totalConversations = randomInt(20, 80);
      const totalRespondidas = Math.round(totalConversations * 0.75);
      
      metrics.push({
        id: uuidv4(),
        total_conversations: totalConversations,
        total_respondidas: totalRespondidas,
        response_rate: ((totalRespondidas / totalConversations) * 100).toFixed(2),
        conversion_rate: randomInt(10, 25),
        negotiated_value: randomInt(25000, 75000),
        avg_response_time: randomInt(30, 120),
        created_at: date.toISOString()
      });
    }

    const { error: metricsError } = await supabase.from('conversation_metrics').insert(metrics);
    if (metricsError) {
      console.error('Erro ao inserir métricas:', metricsError.message);
    } else {
      console.log(`✅ ${metrics.length} métricas de conversação inseridas`);
    }

    // 4. Popular funnel_data
    console.log('\n📊 Populando dados de funil...');
    const funnelStages = [
      { name: 'Lead', value: 100, color: '#3B82F6' },
      { name: 'Qualificado', value: 65, color: '#10B981' },
      { name: 'Reunião Agendada', value: 40, color: '#F59E0B' },
      { name: 'Proposta Enviada', value: 25, color: '#EF4444' },
      { name: 'Fechado', value: 12, color: '#059669' }
    ];

    const funnelData = funnelStages.map(stage => ({
      id: uuidv4(),
      name: stage.name,
      value: stage.value,
      percentage: stage.value.toString(),
      color: stage.color,
      created_at: new Date().toISOString()
    }));

    const { error: funnelError } = await supabase.from('funnel_data').insert(funnelData);
    if (funnelError) {
      console.error('Erro ao inserir funnel_data:', funnelError.message);
    } else {
      console.log(`✅ ${funnelData.length} dados de funil inseridos`);
    }

    // 5. Popular utm_tracking
    console.log('\n🎯 Populando tracking UTM...');
    const utmData = [];
    const sources = ['google', 'facebook', 'instagram', 'linkedin', 'email'];
    const campaigns = ['summer_sale', 'black_friday', 'new_year', 'lead_gen'];

    for (let i = 0; i < 100; i++) {
      const hasConversion = Math.random() > 0.7;
      utmData.push({
        id: uuidv4(),
        utm_source: randomChoice(sources),
        utm_campaign: randomChoice(campaigns),
        utm_medium: 'cpc',
        device_type: randomChoice(['desktop', 'mobile', 'tablet']),
        utm_conversion: hasConversion,
        utm_conversion_value: hasConversion ? randomInt(1000, 5000) : null,
        created_at: randomDate().toISOString()
      });
    }

    const { error: utmError } = await supabase.from('utm_tracking').insert(utmData);
    if (utmError) {
      console.error('Erro ao inserir UTM:', utmError.message);
    } else {
      console.log(`✅ ${utmData.length} registros UTM inseridos`);
    }

    // 6. Popular client_stats
    console.log('\n📈 Populando estatísticas de clientes...');
    const clientStats = {
      id: uuidv4(),
      total_clients: contacts.length,
      new_clients_this_month: 15,
      total_chats: 250,
      created_at: new Date().toISOString()
    };

    const { error: statsError } = await supabase.from('client_stats').insert([clientStats]);
    if (statsError) {
      console.error('Erro ao inserir client_stats:', statsError.message);
    } else {
      console.log('✅ Estatísticas de clientes inseridas');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 SEEDING CONCLUÍDO COM SUCESSO!');
    console.log('');
    console.log('📊 DADOS CRIADOS:');
    console.log(`👥 Contatos: ${contacts.length}`);
    console.log(`💬 Métricas: ${metrics.length}`);
    console.log(`📈 Funil: ${funnelData.length} estágios`);
    console.log(`🎯 UTM: ${utmData.length} registros`);
    console.log('📊 Estatísticas: 1 registro');
    console.log('');
    console.log('✨ Dashboard de métricas agora tem dados realistas!');
    console.log('🔄 Recarregue a página /metrics para ver os resultados');

  } catch (error) {
    console.error('❌ ERRO DURANTE EXECUÇÃO:', error);
  }
})();