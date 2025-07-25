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

// Dados dos clientes de exemplo
const sampleClients = [
  {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1111',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    client_name: 'Silva Náutica',
    status: 'Active',
    consultation_stage: 'Nova consulta',
    tags: ['vip', 'interessado'],
    budget: 150000.00,
    client_sector: 'Náutico',
    notes: 'Cliente interessado em lancha de luxo'
  },
  {
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(21) 88888-2222',
    address: 'Av. Atlântica, 456 - Rio de Janeiro, RJ',
    client_name: 'Santos Marine',
    status: 'Active',
    consultation_stage: 'Qualificado',
    tags: ['premium', 'urgente'],
    budget: 250000.00,
    client_sector: 'Náutico',
    notes: 'Procura iate para eventos corporativos'
  },
  {
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    phone: '(11) 77777-3333',
    address: 'Rua do Porto, 789 - Santos, SP',
    client_name: 'Oliveira Boats',
    status: 'Active',
    consultation_stage: 'Proposta enviada',
    tags: ['corporativo'],
    budget: 80000.00,
    client_sector: 'Náutico',
    notes: 'Interessado em embarcação para pesca esportiva'
  },
  {
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(47) 66666-4444',
    address: 'Marina Boulevard, 321 - Balneário Camboriú, SC',
    client_name: 'Costa Yachts',
    status: 'Active',
    consultation_stage: 'Negociação',
    tags: ['luxury', 'repeat-customer'],
    budget: 500000.00,
    client_sector: 'Náutico',
    notes: 'Cliente fiel, procura upgrade de iate'
  },
  {
    name: 'Roberto Lima',
    email: 'roberto.lima@email.com',
    phone: '(85) 55555-5555',
    address: 'Praia de Iracema, 654 - Fortaleza, CE',
    client_name: 'Lima Náutica',
    status: 'Active',
    consultation_stage: 'Chamada agendada',
    tags: ['new-client'],
    budget: 120000.00,
    client_sector: 'Náutico',
    notes: 'Primeiro contato, interessado em lancha para família'
  }
];

async function createTestUser() {
  console.log('👤 Criando usuário de teste...');
  
  const testEmail = 'test@valoredash.com';
  const testPassword = 'TestPassword123!';
  
  // Tentar fazer login primeiro
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  
  if (!loginError && loginData.user) {
    console.log('✅ Login realizado com sucesso:', testEmail);
    return loginData.user;
  }
  
  // Se login falhou, tentar criar usuário
  console.log('🔄 Tentando criar novo usuário...');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword
  });
  
  if (signUpError) {
    console.error('❌ Erro ao criar usuário:', signUpError.message);
    return null;
  }
  
  if (signUpData.user) {
    console.log('✅ Usuário criado com sucesso:', testEmail);
    return signUpData.user;
  }
  
  return null;
}

async function insertSampleClients() {
  console.log('🚀 Iniciando inserção de clientes de exemplo...');
  
  try {
    // Primeiro, tentar obter usuário atual
    let { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Se não há usuário autenticado, criar/fazer login com usuário de teste
    if (authError || !user) {
      console.log('⚠️  Nenhum usuário autenticado. Criando usuário de teste...');
      user = await createTestUser();
      
      if (!user) {
        console.error('❌ Não foi possível autenticar ou criar usuário.');
        return;
      }
    }
    
    console.log('✅ Usuário autenticado:', user.email);
    
    // Adicionar user_id aos clientes
    const clientsWithUserId = sampleClients.map(client => ({
      ...client,
      user_id: user.id
    }));
    
    // Inserir clientes
    const { data, error } = await supabase
      .from('contacts')
      .insert(clientsWithUserId)
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir clientes:', error.message);
      console.error('Detalhes:', error);
      return;
    }
    
    console.log('✅ Clientes inseridos com sucesso!');
    console.log(`📊 Total de clientes inseridos: ${data.length}`);
    
    // Mostrar resumo dos clientes inseridos
    console.log('\n📋 Clientes inseridos:');
    data.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name} (${client.client_name}) - ${client.consultation_stage}`);
    });
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar a função
insertSampleClients();