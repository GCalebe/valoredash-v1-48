require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Configurado' : 'NÃO ENCONTRADO');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'Configurado' : 'NÃO ENCONTRADO');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function findUserByEmail(email) {
  try {
    console.log(`🔍 Buscando usuário com email: ${email}`);
    
    // Buscar na tabela auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erro ao buscar usuários auth:', authError.message);
      return null;
    }
    
    const user = authUsers.users.find(u => u.email === email);
    
    if (user) {
      console.log('✅ Usuário encontrado na tabela auth.users:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Criado em:', user.created_at);
      return user.id;
    } else {
      console.log('❌ Usuário não encontrado na tabela auth.users');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro geral ao buscar usuário:', error.message);
    return null;
  }
}

async function checkAgendas() {
  try {
    console.log('\n📅 Verificando agendas existentes...');
    
    const { data: agendas, error } = await supabase
      .from('agendas')
      .select('*');
    
    if (error) {
      console.error('❌ Erro ao buscar agendas:', error.message);
      return [];
    }
    
    console.log(`📊 Total de agendas encontradas: ${agendas.length}`);
    
    if (agendas.length > 0) {
      console.log('\n📋 Agendas existentes:');
      agendas.forEach((agenda, index) => {
        console.log(`${index + 1}. ID: ${agenda.id}`);
        console.log(`   Nome: ${agenda.name || 'N/A'}`);
        console.log(`   Created By: ${agenda.created_by || 'N/A'}`);
        console.log(`   Criado em: ${agenda.created_at || 'N/A'}`);
        console.log('   ---');
      });
    }
    
    return agendas;
  } catch (error) {
    console.error('❌ Erro geral ao verificar agendas:', error.message);
    return [];
  }
}

async function deleteAllAgendas() {
  try {
    console.log('\n🗑️ Excluindo todas as agendas...');
    
    const { error } = await supabase
      .from('agendas')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (error) {
      console.error('❌ Erro ao excluir agendas:', error.message);
      return false;
    }
    
    console.log('✅ Todas as agendas foram excluídas');
    return true;
  } catch (error) {
    console.error('❌ Erro geral ao excluir agendas:', error.message);
    return false;
  }
}

async function createAgendasForUser(userId) {
  try {
    console.log(`\n📝 Criando agendas para o usuário: ${userId}`);
    
    const agendasToCreate = [
      {
        name: 'Agenda Principal',
        description: 'Agenda principal para atendimentos',
        created_by: userId,
        duration_minutes: 60,
        price: 150.00,
        category: 'consulta',
        is_active: true,
        max_participants: 1,
        requires_approval: false,
        buffer_time_minutes: 15,
        cancellation_policy: 'Cancelamento até 24h antes do agendamento',
        preparation_notes: 'Preparar material de consulta',
        follow_up_notes: 'Acompanhar evolução do cliente'
      },
      {
        name: 'Agenda Secundária',
        description: 'Agenda para eventos especiais e workshops',
        created_by: userId,
        duration_minutes: 120,
        price: 250.00,
        category: 'workshop',
        is_active: true,
        max_participants: 10,
        requires_approval: true,
        buffer_time_minutes: 30,
        cancellation_policy: 'Cancelamento até 48h antes do evento',
        preparation_notes: 'Preparar material didático e espaço',
        follow_up_notes: 'Enviar material complementar'
      }
    ];
    
    const { data, error } = await supabase
      .from('agendas')
      .insert(agendasToCreate)
      .select();
    
    if (error) {
      console.error('❌ Erro ao criar agendas:', error.message);
      return false;
    }
    
    console.log('✅ Agendas criadas com sucesso!');
    console.log(`📊 Total criadas: ${data.length}`);
    
    data.forEach((agenda, index) => {
      console.log(`${index + 1}. ${agenda.name} (ID: ${agenda.id})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro geral ao criar agendas:', error.message);
    return false;
  }
}

async function main() {
  console.log('=== VERIFICAÇÃO E CORREÇÃO DE AGENDAS ===');
  console.log('🔑 Usando SERVICE_ROLE_KEY para operações administrativas\n');
  
  // 1. Encontrar o ID do usuário
  const userId = await findUserByEmail('gabriel@alves.com');
  
  if (!userId) {
    console.error('❌ Não foi possível encontrar o usuário gabriel@alves.com');
    process.exit(1);
  }
  
  // 2. Verificar agendas existentes
  const existingAgendas = await checkAgendas();
  
  // 3. Verificar se alguma agenda já pertence ao usuário
    const userAgendas = existingAgendas.filter(agenda => agenda.created_by === userId);
  
  if (userAgendas.length > 0) {
    console.log(`\n✅ Encontradas ${userAgendas.length} agenda(s) já associada(s) ao usuário`);
    console.log('📋 Agendas do usuário:');
    userAgendas.forEach((agenda, index) => {
      console.log(`${index + 1}. ${agenda.name} (ID: ${agenda.id})`);
    });
  } else {
    console.log('\n⚠️ Nenhuma agenda encontrada para o usuário');
    
    // 4. Excluir todas as agendas existentes
    if (existingAgendas.length > 0) {
      const deleted = await deleteAllAgendas();
      if (!deleted) {
        console.error('❌ Falha ao excluir agendas existentes');
        process.exit(1);
      }
    }
    
    // 5. Criar novas agendas para o usuário
    const created = await createAgendasForUser(userId);
    if (!created) {
      console.error('❌ Falha ao criar novas agendas');
      process.exit(1);
    }
  }
  
  // 6. Verificação final
  console.log('\n🔍 Verificação final...');
  await checkAgendas();
  
  console.log('\n🎉 Processo concluído com sucesso!');
  console.log('✅ O usuário gabriel@alves.com agora possui agendas associadas');
}

main().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});