const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.error('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para gerar dados de crescimento mensal
function generateMonthlyGrowthData() {
  const months = [
    '2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01', '2024-06-01',
    '2024-07-01', '2024-08-01', '2024-09-01', '2024-10-01', '2024-11-01', '2024-12-01'
  ];
  
  const data = [];
  let baseNewUsers = 35;
  let baseActiveUsers = 120;
  let baseRevenue = 12000;
  let baseMRR = 8000;
  
  months.forEach((month, index) => {
    // Crescimento variável entre 5% e 25%
    const growthRate = 5 + Math.random() * 20;
    const newUsers = Math.floor(baseNewUsers * (1 + growthRate / 100));
    const activeUsers = Math.floor(baseActiveUsers * (1 + (growthRate + 5) / 100));
    const churned = Math.floor(activeUsers * 0.05); // 5% churn rate
    const revenue = baseRevenue * (1 + (growthRate + 10) / 100);
    const mrr = baseMRR * (1 + growthRate / 100);
    const arr = mrr * 12;
    const newDeals = Math.floor(15 + Math.random() * 20);
    const closedDeals = Math.floor(newDeals * 0.7); // 70% close rate
    const dealValue = revenue / closedDeals;
    
    data.push({
      month_year: month,
      new_users: newUsers,
      active_users: activeUsers,
      churned_users: churned,
      revenue: Math.round(revenue * 100) / 100,
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      new_deals: newDeals,
      closed_deals: closedDeals,
      deal_value: Math.round(dealValue * 100) / 100,
      conversion_rate: Math.round((closedDeals / newDeals) * 100 * 100) / 100,
      created_at: new Date().toISOString()
    });
    
    // Atualizar base para próximo mês
    baseNewUsers = newUsers;
    baseActiveUsers = activeUsers;
    baseRevenue = revenue;
    baseMRR = mrr;
  });
  
  return data;
}

// Função para gerar dados de UTM tracking
function generateUTMTrackingData() {
  const sources = ['google', 'facebook', 'instagram', 'linkedin', 'email', 'direct', 'referral'];
  const mediums = ['cpc', 'social', 'email', 'organic', 'referral', 'display'];
  const campaigns = [
    'summer_sale', 'brand_awareness', 'product_launch', 'retargeting',
    'lead_generation', 'conversion_campaign', 'awareness_drive'
  ];
  const devices = ['desktop', 'mobile', 'tablet'];
  const landingPages = [
    '/landing/home', '/landing/products', '/landing/services',
    '/landing/contact', '/landing/about', '/deals', '/promo'
  ];
  
  const data = [];
  
  // Gerar 50 registros de UTM tracking
  for (let i = 0; i < 50; i++) {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const medium = mediums[Math.floor(Math.random() * mediums.length)];
    const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
    const device = devices[Math.floor(Math.random() * devices.length)];
    const landingPage = landingPages[Math.floor(Math.random() * landingPages.length)];
    
    // Simular conversões (30% de chance)
    const hasConversion = Math.random() < 0.3;
    const conversionValue = hasConversion ? Math.round((50 + Math.random() * 500) * 100) / 100 : null;
    const conversionStage = hasConversion ? ['lead', 'qualified', 'proposal', 'closed'][Math.floor(Math.random() * 4)] : null;
    
    // Datas dos últimos 3 meses
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    const firstTouchDate = new Date(createdAt);
    firstTouchDate.setHours(firstTouchDate.getHours() - Math.floor(Math.random() * 24));
    
    const lastTouchDate = new Date(createdAt);
    lastTouchDate.setMinutes(lastTouchDate.getMinutes() + Math.floor(Math.random() * 60));
    
    data.push({
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      utm_term: `term_${i + 1}`,
      utm_content: `content_${i + 1}`,
      utm_referrer: Math.random() < 0.3 ? 'https://example.com/referrer' : null,
      referrer: Math.random() < 0.4 ? 'https://google.com' : null,
      gclid: source === 'google' ? `gclid_${i + 1}` : null,
      fbclid: source === 'facebook' ? `fbclid_${i + 1}` : null,
      utm_session_id: `session_${i + 1}_${Date.now()}`,
      first_seen_at: firstTouchDate.toISOString(),
      utm_first_touch: firstTouchDate.toISOString(),
      utm_last_touch: lastTouchDate.toISOString(),
      first_utm_source: source,
      first_utm_medium: medium,
      first_utm_campaign: campaign,
      first_utm_term: `term_${i + 1}`,
      first_utm_content: `content_${i + 1}`,
      first_utm_created_at: firstTouchDate.toISOString(),
      last_utm_source: source,
      last_utm_medium: medium,
      last_utm_campaign: campaign,
      last_utm_term: `term_${i + 1}`,
      last_utm_content: `content_${i + 1}`,
      last_utm_created_at: lastTouchDate.toISOString(),
      ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      device_type: device,
      landing_page: landingPage,
      utm_conversion: hasConversion,
      utm_conversion_at: hasConversion ? createdAt.toISOString() : null,
      utm_conversion_value: conversionValue,
      utm_conversion_stage: conversionStage,
      utm_id: `utm_${i + 1}`,
      geo_location: JSON.stringify({
        country: 'BR',
        state: 'SP',
        city: 'São Paulo',
        lat: -23.5505,
        lng: -46.6333
      }),
      created_at: createdAt.toISOString()
    });
  }
  
  return data;
}

// Função para popular monthly_growth
async function seedMonthlyGrowth() {
  console.log('📈 Populando tabela monthly_growth...');
  
  try {
    const data = generateMonthlyGrowthData();
    
    const { data: result, error } = await supabase
      .from('monthly_growth')
      .insert(data)
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir dados em monthly_growth:', error);
      return false;
    }
    
    console.log(`✅ ${result.length} registros inseridos em monthly_growth`);
    return true;
  } catch (error) {
    console.error('❌ Erro na função seedMonthlyGrowth:', error);
    return false;
  }
}

// Função para popular utm_tracking
async function seedUTMTracking() {
  console.log('🎯 Populando tabela utm_tracking...');
  
  try {
    const data = generateUTMTrackingData();
    
    const { data: result, error } = await supabase
      .from('utm_tracking')
      .insert(data)
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir dados em utm_tracking:', error);
      return false;
    }
    
    console.log(`✅ ${result.length} registros inseridos em utm_tracking`);
    return true;
  } catch (error) {
    console.error('❌ Erro na função seedUTMTracking:', error);
    return false;
  }
}

// Função principal
async function seedMissingTables() {
  console.log('🚀 Iniciando seeding das tabelas faltantes...');
  console.log('=' .repeat(50));
  
  try {
    // Verificar conexão com Supabase
    const { data: testData, error: testError } = await supabase
      .from('contacts')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão com Supabase:', testError);
      return;
    }
    
    console.log('✅ Conexão com Supabase estabelecida');
    
    // Popular monthly_growth
    const monthlyGrowthSuccess = await seedMonthlyGrowth();
    
    // Popular utm_tracking
    const utmTrackingSuccess = await seedUTMTracking();
    
    console.log('=' .repeat(50));
    
    if (monthlyGrowthSuccess && utmTrackingSuccess) {
      console.log('🎉 Seeding das tabelas faltantes concluído com sucesso!');
      console.log('📊 Todos os gráficos do dashboard agora têm dados disponíveis');
    } else {
      console.log('⚠️ Seeding concluído com alguns erros. Verifique os logs acima.');
    }
    
    // Verificar contagens finais
    console.log('\n📋 Verificação final das tabelas:');
    
    const { data: monthlyCount } = await supabase
      .from('monthly_growth')
      .select('id', { count: 'exact', head: true });
    
    const { data: utmCount } = await supabase
      .from('utm_tracking')
      .select('id', { count: 'exact', head: true });
    
    console.log(`📈 monthly_growth: ${monthlyCount?.length || 'N/A'} registros`);
    console.log(`🎯 utm_tracking: ${utmCount?.length || 'N/A'} registros`);
    
  } catch (error) {
    console.error('❌ Erro geral no seeding:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedMissingTables()
    .then(() => {
      console.log('\n✨ Processo finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = {
  seedMissingTables,
  seedMonthlyGrowth,
  seedUTMTracking
};