const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.log('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados mockados das agendas para inserir no banco
const mockAgendasData = [
  {
    name: 'Consulta de Terapia',
    description: 'Sessão individual de terapia para bem-estar mental.',
    category: 'consulta',
    duration_minutes: 50,
    buffer_time_minutes: 10,
    price: 150.00,
    is_active: true,
    max_participants: 1,
    requires_approval: false,
    cancellation_policy: 'Cancelamento com 24h de antecedência',
    preparation_notes: 'Prepare-se para uma sessão de autoconhecimento',
    follow_up_notes: 'Acompanhamento recomendado em 1 semana'
  },
  {
    name: 'Webinar de Marketing',
    description: 'Aprenda as novas estratégias de marketing digital com especialistas.',
    category: 'evento',
    duration_minutes: 90,
    buffer_time_minutes: 0,
    price: 0.00,
    is_active: true,
    max_participants: 100,
    requires_approval: true,
    cancellation_policy: 'Cancelamento até 2h antes do evento',
    preparation_notes: 'Tenha papel e caneta para anotações',
    follow_up_notes: 'Material complementar será enviado por email'
  },
  {
    name: 'Aula de Yoga',
    description: 'Yoga para iniciantes, focando em postura e respiração.',
    category: 'classes',
    duration_minutes: 60,
    buffer_time_minutes: 0,
    price: 45.00,
    is_active: true,
    max_participants: 15,
    requires_approval: false,
    cancellation_policy: 'Cancelamento com 12h de antecedência',
    preparation_notes: 'Traga tapete de yoga e roupas confortáveis',
    follow_up_notes: 'Pratique os exercícios em casa'
  },
  {
    name: 'Consulta Nutricional',
    description: 'Avaliação nutricional completa com plano alimentar personalizado.',
    category: 'consulta',
    duration_minutes: 45,
    buffer_time_minutes: 15,
    price: 120.00,
    is_active: true,
    max_participants: 1,
    requires_approval: false,
    cancellation_policy: 'Cancelamento com 24h de antecedência',
    preparation_notes: 'Traga exames recentes se disponível',
    follow_up_notes: 'Retorno em 30 dias para acompanhamento'
  },
  {
    name: 'Workshop de Programação',
    description: 'Introdução ao desenvolvimento web com React e Node.js.',
    category: 'classes',
    duration_minutes: 180,
    buffer_time_minutes: 30,
    price: 200.00,
    is_active: true,
    max_participants: 20,
    requires_approval: true,
    cancellation_policy: 'Cancelamento com 48h de antecedência',
    preparation_notes: 'Instale Node.js e VS Code antes da aula',
    follow_up_notes: 'Código fonte será disponibilizado no GitHub'
  }
];

async function seedAgendas() {
  try {
    console.log('🚀 Iniciando inserção de dados mockados das agendas...');
    
    // Verificar se já existem agendas
    const { data: existingAgendas, error: checkError } = await supabase
      .from('agendas')
      .select('id, name')
      .limit(5);
    
    if (checkError) {
      console.error('❌ Erro ao verificar agendas existentes:', checkError);
      return;
    }
    
    if (existingAgendas && existingAgendas.length > 0) {
      console.log('ℹ️  Agendas já existem no banco:');
      existingAgendas.forEach(agenda => {
        console.log(`   - ${agenda.name} (ID: ${agenda.id})`);
      });
      console.log('\n🔄 Removendo agendas existentes para inserir dados mockados...');
      
      // Remover agendas existentes
      const { error: deleteError } = await supabase
        .from('agendas')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (deleteError) {
        console.error('❌ Erro ao remover agendas existentes:', deleteError);
        return;
      }
      
      console.log('✅ Agendas existentes removidas com sucesso!');
    }
    
    // Inserir novos dados mockados
    console.log('\n📝 Inserindo dados mockados das agendas...');
    
    const { data: insertedAgendas, error: insertError } = await supabase
      .from('agendas')
      .insert(mockAgendasData)
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir agendas:', insertError);
      return;
    }
    
    console.log('\n✅ Agendas inseridas com sucesso!');
    console.log(`📊 Total de agendas inseridas: ${insertedAgendas.length}`);
    
    console.log('\n📋 Agendas inseridas:');
    insertedAgendas.forEach((agenda, index) => {
      console.log(`${index + 1}. ${agenda.name}`);
      console.log(`   - Categoria: ${agenda.category}`);
      console.log(`   - Duração: ${agenda.duration_minutes} minutos`);
      console.log(`   - Preço: R$ ${agenda.price ? agenda.price.toFixed(2) : '0.00'}`);
      console.log(`   - Máx. participantes: ${agenda.max_participants || 'Ilimitado'}`);
      console.log(`   - ID: ${agenda.id}`);
      console.log('');
    });
    
    console.log('🎉 Processo concluído com sucesso!');
    console.log('\n💡 Agora você pode testar a tela de conhecimento e ver as agendas do banco de dados.');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o seeding
seedAgendas();