// Script abrangente para popular o banco de dados com dados realistas
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
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

function normalDistribution(mean, stdDev) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean;
}

// Dados de referência
const clientTypes = ['Pessoa Física', 'MEI', 'ME', 'EPP', 'Ltda', 'SA'];
const clientSectors = ['Tecnologia', 'Varejo', 'Serviços', 'Indústria', 'Consultoria', 'E-commerce', 'Saúde', 'Educação'];
const clientSizes = ['Micro', 'Pequeno', 'Médio', 'Grande'];
const kanbanStages = ['Lead', 'Qualificado', 'Reunião Agendada', 'Proposta Enviada', 'Negociação', 'Fechado', 'Perdido'];
const utmSources = ['google', 'facebook', 'instagram', 'linkedin', 'email', 'whatsapp', 'direct', 'referral'];
const utmMediums = ['cpc', 'social', 'email', 'organic', 'referral', 'display', 'whatsapp'];
const utmCampaigns = [
  'summer_sale_2024', 'black_friday_2024', 'new_year_promo', 'easter_campaign',
  'back_to_school', 'christmas_2024', 'mothers_day', 'fathers_day',
  'brand_awareness', 'lead_generation', 'retargeting', 'conversion_boost'
];

// 1. Popular tabela contacts com dados expandidos
async function seedContacts() {
  console.log('🎯 Populando tabela contacts...');
  
  const contacts = [];
  const names = [
    'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Souza',
    'Luciana Lima', 'Rafael Alves', 'Fernanda Rocha', 'Marcos Pereira', 'Julia Martins',
    'Roberto Nascimento', 'Camila Ferreira', 'Diego Barbosa', 'Patricia Gomes', 'Leonardo Dias',
    'Gabriela Ribeiro', 'Thiago Cardoso', 'Vanessa Castro', 'Bruno Araújo', 'Isabela Moreira'
  ];
  
  const companies = [
    'Tech Solutions', 'Digital Marketing Pro', 'Inovação Ltda', 'Consultoria Avançada',
    'E-commerce Plus', 'Startup Criativa', 'Negócios Digitais', 'Vendas Online',
    'Marketing 360', 'Gestão Empresarial', 'Automação Comercial', 'Estratégia Digital'
  ];

  for (let i = 0; i < 150; i++) {
    const createdAt = randomDate(new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), new Date());
    const clientType = randomChoice(clientTypes);
    const name = randomChoice(names);
    const companyName = Math.random() > 0.3 ? randomChoice(companies) : null;
    
    // Simular progressão temporal no kanban
    const daysSinceCreation = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
    let kanbanStage = 'Lead';
    
    if (daysSinceCreation > 3) {
      const progressChance = Math.random();
      if (progressChance > 0.7) kanbanStage = 'Qualificado';
      if (progressChance > 0.8 && daysSinceCreation > 7) kanbanStage = 'Reunião Agendada';
      if (progressChance > 0.85 && daysSinceCreation > 14) kanbanStage = 'Proposta Enviada';
      if (progressChance > 0.9 && daysSinceCreation > 21) kanbanStage = randomChoice(['Negociação', 'Fechado', 'Perdido']);
    }

    // Valor de venda baseado no tipo de cliente e estágio
    let sales = 0;
    if (kanbanStage === 'Fechado') {
      const baseValue = clientType === 'Pessoa Física' ? 1500 : 
                       clientType === 'MEI' ? 3000 :
                       clientType === 'ME' ? 8000 : 15000;
      sales = Math.round(normalDistribution(baseValue, baseValue * 0.3));
    }

    contacts.push({
      id: uuidv4(),
      name: name,
      client_name: companyName,
      email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
      phone: `(11) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
      client_type: clientType,
      client_sector: randomChoice(clientSectors),
      client_size: randomChoice(clientSizes),
      kanban_stage: kanbanStage,
      consultation_stage: kanbanStage,
      budget: Math.round(normalDistribution(10000, 5000)),
      sales: sales,
      status: kanbanStage === 'Perdido' ? 'Inactive' : 'Active',
      tags: Math.random() > 0.5 ? [randomChoice(['quente', 'frio', 'urgente', 'vip'])] : null,
      notes: Math.random() > 0.7 ? 'Cliente com potencial interessante' : null,
      session_id: `session_${i + 1}_${Date.now()}`,
      unread_count: randomInt(0, 5),
      last_contact: randomDate(createdAt, new Date()),
      last_message_time: randomDate(createdAt, new Date()),
      created_at: createdAt.toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Inserir em lotes
  const batchSize = 50;
  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize);
    const { error } = await supabase.from('contacts').insert(batch);
    
    if (error) {
      console.error(`Erro ao inserir lote de contatos ${i}-${i + batch.length}:`, error.message);
    } else {
      console.log(`✅ Inseridos contatos ${i + 1}-${i + batch.length}`);
    }
  }
  
  return contacts;
}

// 2. Popular conversation_metrics com dados realistas
async function seedConversationMetrics() {
  console.log('💬 Populando conversation_metrics...');
  
  const metrics = [];
  const today = new Date();
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simular sazonalidade (mais conversas nos dias úteis)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendMultiplier = isWeekend ? 0.3 : 1.0;
    
    // Simular crescimento ao longo do tempo
    const growthFactor = 1 + (90 - i) * 0.01;
    
    const baseConversations = Math.round(normalDistribution(25, 8) * weekendMultiplier * growthFactor);
    const totalConversations = Math.max(1, baseConversations);
    const totalRespondidas = Math.round(totalConversations * normalDistribution(0.75, 0.1));
    const totalSecondaryResponses = Math.round(totalRespondidas * normalDistribution(0.4, 0.1));
    
    // Métricas de tempo em minutos
    const avgResponseTime = normalDistribution(45, 15);
    const avgResponseStartTime = normalDistribution(25, 10);
    const avgClosingTime = normalDistribution(2880, 720); // ~2 dias ± 12h
    
    // Valores financeiros
    const negotiatedValue = Math.round(normalDistribution(45000, 15000));
    const totalNegotiatingValue = Math.round(normalDistribution(120000, 40000));
    const averageNegotiatedValue = negotiatedValue / Math.max(1, totalRespondidas);
    
    metrics.push({
      id: uuidv4(),
      total_conversations: totalConversations,
      total_respondidas: totalRespondidas,
      total_secondary_responses: totalSecondaryResponses,
      response_rate: (totalRespondidas / totalConversations * 100).toFixed(2),
      secondary_response_rate: (totalSecondaryResponses / totalRespondidas * 100).toFixed(2),
      conversion_rate: ((totalRespondidas * 0.15) / totalConversations * 100).toFixed(2),
      avg_response_time: avgResponseTime.toFixed(2),
      avg_response_start_time: avgResponseStartTime.toFixed(2),
      avg_closing_time: avgClosingTime.toFixed(2),
      negotiated_value: negotiatedValue,
      total_negotiating_value: totalNegotiatingValue,
      average_negotiated_value: averageNegotiatedValue.toFixed(2),
      previous_period_value: i > 0 ? metrics[i-1]?.negotiated_value || 0 : 0,
      is_stale: i > 7, // Dados mais antigos que 7 dias são considerados stale
      created_at: date.toISOString()
    });
  }

  const { error } = await supabase.from('conversation_metrics').insert(metrics);
  
  if (error) {
    console.error('Erro ao inserir conversation_metrics:', error.message);
  } else {
    console.log(`✅ Inseridas ${metrics.length} métricas de conversação`);
  }
  
  return metrics;
}

// 3. Popular funnel_data com dados consistentes
async function seedFunnelData() {
  console.log('📊 Populando funnel_data...');
  
  const funnelData = [];
  const stages = [
    { name: 'Lead', color: '#3B82F6', baseValue: 100 },
    { name: 'Qualificado', color: '#10B981', baseValue: 65 },
    { name: 'Reunião Agendada', color: '#F59E0B', baseValue: 40 },
    { name: 'Proposta Enviada', color: '#EF4444', baseValue: 25 },
    { name: 'Negociação', color: '#8B5CF6', baseValue: 15 },
    { name: 'Fechado', color: '#059669', baseValue: 8 }
  ];

  for (let day = 0; day < 90; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    
    // Calcular taxa de conversão realista entre estágios
    let previousValue = 100;
    
    stages.forEach((stage, index) => {
      let value;
      if (index === 0) {
        // Lead: valor base com variação sazonal
        const dayOfWeek = date.getDay();
        const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.4 : 1.0;
        value = Math.round(normalDistribution(stage.baseValue, 20) * weekendMultiplier);
      } else {
        // Outros estágios: porcentagem do estágio anterior
        const conversionRate = stage.baseValue / stages[index - 1].baseValue;
        value = Math.round(previousValue * normalDistribution(conversionRate, conversionRate * 0.2));
      }
      
      value = Math.max(0, value);
      const percentage = index === 0 ? 100 : (value / stages[0].baseValue * 100);
      
      funnelData.push({
        id: uuidv4(),
        name: stage.name,
        value: value,
        percentage: percentage.toFixed(1),
        color: stage.color,
        created_at: date.toISOString()
      });
      
      previousValue = value;
    });
  }

  // Inserir em lotes
  const batchSize = 100;
  for (let i = 0; i < funnelData.length; i += batchSize) {
    const batch = funnelData.slice(i, i + batchSize);
    const { error } = await supabase.from('funnel_data').insert(batch);
    
    if (error) {
      console.error(`Erro ao inserir lote de funnel_data ${i}-${i + batch.length}:`, error.message);
    } else {
      console.log(`✅ Inseridos dados de funil ${i + 1}-${i + batch.length}`);
    }
  }
  
  return funnelData;
}

// 4. Popular utm_tracking expandido
async function seedUTMTracking() {
  console.log('🎯 Populando utm_tracking...');
  
  const utmData = [];
  
  for (let i = 0; i < 500; i++) {
    const createdAt = randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
    const source = randomChoice(utmSources);
    const medium = randomChoice(utmMediums);
    const campaign = randomChoice(utmCampaigns);
    
    // Simular conversões realistas baseadas na fonte
    let conversionRate = 0.1; // Base 10%
    if (source === 'google') conversionRate = 0.25;
    if (source === 'facebook') conversionRate = 0.15;
    if (source === 'email') conversionRate = 0.35;
    if (source === 'direct') conversionRate = 0.45;
    
    const hasConversion = Math.random() < conversionRate;
    const conversionValue = hasConversion ? Math.round(normalDistribution(2500, 1000)) : null;
    
    utmData.push({
      id: uuidv4(),
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      utm_term: `kw_${i + 1}`,
      utm_content: `ad_content_${i + 1}`,
      utm_session_id: `session_utm_${i + 1}_${Date.now()}`,
      device_type: randomChoice(['desktop', 'mobile', 'tablet']),
      landing_page: randomChoice(['/home', '/services', '/contact', '/pricing', '/about']),
      utm_conversion: hasConversion,
      utm_conversion_value: conversionValue,
      utm_conversion_stage: hasConversion ? randomChoice(['lead', 'qualified', 'proposal', 'closed']) : null,
      first_seen_at: createdAt.toISOString(),
      utm_first_touch: createdAt.toISOString(),
      utm_last_touch: new Date(createdAt.getTime() + randomInt(0, 7200000)).toISOString(), // até 2h depois
      geo_location: JSON.stringify({
        country: 'BR',
        state: randomChoice(['SP', 'RJ', 'MG', 'RS', 'PR']),
        city: randomChoice(['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Curitiba'])
      }),
      created_at: createdAt.toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Inserir em lotes
  const batchSize = 100;
  for (let i = 0; i < utmData.length; i += batchSize) {
    const batch = utmData.slice(i, i + batchSize);
    const { error } = await supabase.from('utm_tracking').insert(batch);
    
    if (error) {
      console.error(`Erro ao inserir lote de utm_tracking ${i}-${i + batch.length}:`, error.message);
    } else {
      console.log(`✅ Inseridos dados UTM ${i + 1}-${i + batch.length}`);
    }
  }
  
  return utmData;
}

// 5. Popular client_stats
async function seedClientStats() {
  console.log('📈 Populando client_stats...');
  
  const stats = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simular crescimento gradual
    const growthFactor = 1 + (30 - i) * 0.02;
    
    stats.push({
      id: uuidv4(),
      total_clients: Math.round(normalDistribution(150, 30) * growthFactor),
      new_clients_this_month: Math.round(normalDistribution(25, 8)),
      total_chats: Math.round(normalDistribution(300, 60) * growthFactor),
      created_at: date.toISOString()
    });
  }

  const { error } = await supabase.from('client_stats').insert(stats);
  
  if (error) {
    console.error('Erro ao inserir client_stats:', error.message);
  } else {
    console.log(`✅ Inseridas ${stats.length} estatísticas de clientes`);
  }
  
  return stats;
}

// 6. Popular monthly_growth
async function seedMonthlyGrowth() {
  console.log('📊 Populando monthly_growth...');
  
  const monthlyData = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);
  
  let baseUsers = 50;
  let baseRevenue = 15000;
  let baseMRR = 8000;
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    // Simular crescimento mensal variável
    const growthRate = normalDistribution(15, 5) / 100; // 15% ± 5%
    
    const newUsers = Math.round(baseUsers * (1 + growthRate));
    const activeUsers = Math.round(baseUsers * 4 * (1 + growthRate));
    const churned = Math.round(activeUsers * 0.05); // 5% churn
    const revenue = Math.round(baseRevenue * (1 + growthRate));
    const mrr = Math.round(baseMRR * (1 + growthRate));
    
    monthlyData.push({
      id: uuidv4(),
      month_year: date.toISOString().split('T')[0],
      new_users: newUsers,
      active_users: activeUsers,
      churned_users: churned,
      revenue: revenue,
      mrr: mrr,
      arr: mrr * 12,
      new_deals: Math.round(normalDistribution(20, 5)),
      closed_deals: Math.round(normalDistribution(14, 3)),
      deal_value: Math.round(revenue / 14),
      conversion_rate: normalDistribution(70, 10),
      created_at: new Date().toISOString()
    });
    
    // Atualizar bases para próximo mês
    baseUsers = newUsers;
    baseRevenue = revenue;
    baseMRR = mrr;
  }

  const { error } = await supabase.from('monthly_growth').insert(monthlyData);
  
  if (error) {
    console.error('Erro ao inserir monthly_growth:', error.message);
  } else {
    console.log(`✅ Inseridos ${monthlyData.length} dados de crescimento mensal`);
  }
  
  return monthlyData;
}

// Função principal
async function seedComprehensiveData() {
  console.log('🚀 Iniciando seeding abrangente do banco de dados...');
  console.log('=' .repeat(60));
  
  try {
    // Verificar conexão
    const { data: testData, error: testError } = await supabase
      .from('contacts')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão com Supabase:', testError);
      return;
    }
    
    console.log('✅ Conexão com Supabase estabelecida');
    
    // Executar seeding em ordem lógica
    const contacts = await seedContacts();
    const conversationMetrics = await seedConversationMetrics();
    const funnelData = await seedFunnelData();
    const utmData = await seedUTMTracking();
    const clientStats = await seedClientStats();
    const monthlyGrowth = await seedMonthlyGrowth();
    
    console.log('=' .repeat(60));
    console.log('🎉 SEEDING ABRANGENTE CONCLUÍDO COM SUCESSO!');
    console.log('');
    console.log('📊 RESUMO DOS DADOS CRIADOS:');
    console.log(`👥 Contatos: ${contacts.length}`);
    console.log(`💬 Métricas de Conversação: ${conversationMetrics.length}`);
    console.log(`📈 Dados de Funil: ${funnelData.length}`);
    console.log(`🎯 Tracking UTM: ${utmData.length}`);
    console.log(`📊 Estatísticas de Clientes: ${clientStats.length}`);
    console.log(`📈 Crescimento Mensal: ${monthlyGrowth.length}`);
    console.log('');
    console.log('✨ O dashboard de métricas agora possui dados realistas e temporalmente consistentes!');
    
  } catch (error) {
    console.error('❌ Erro durante o seeding:', error);
  }
}

// Executar se chamado diretamente
if (typeof require !== 'undefined' && require.main === module) {
  seedComprehensiveData()
    .then(() => {
      console.log('\n🏁 Processo de seeding finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

export { seedComprehensiveData };