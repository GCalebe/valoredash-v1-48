require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  console.log('Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no .env');
  process.exit(1);
}

console.log('🔗 Conectando ao Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados de exemplo dos clientes (usando a estrutura correta da tabela)
const sampleClients = [
  {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1111',
    client_name: 'Silva Consultoria',
    client_type: 'pessoa-juridica',
    cpf_cnpj: '12.345.678/0001-90',
    kanban_stage_id: null, // Será definido depois se necessário
    consultation_stage: 'Agendamento',
    status: 'Active',
    budget: 15000,
    client_sector: 'Consultoria',
    responsible_user: null,
    tags: ['novo-cliente', 'consultoria'],
    notes: 'Cliente interessado em consultoria empresarial',
    user_id: '00000000-0000-0000-0000-000000000000' // Placeholder, será substituído
  },
  {
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 99999-2222',
    client_name: 'Santos & Associados',
    client_type: 'pessoa-juridica',
    cpf_cnpj: '98.765.432/0001-10',
    kanban_stage_id: null,
    consultation_stage: 'Proposta',
    status: 'Active',
    budget: 25000,
    client_sector: 'Advocacia',
    responsible_user: null,
    tags: ['qualificado', 'advocacia'],
    notes: 'Escritório de advocacia interessado em automação',
    user_id: '00000000-0000-0000-0000-000000000000'
  },
  {
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    phone: '(11) 99999-3333',
    client_name: 'Costa Tech',
    client_type: 'pessoa-juridica',
    cpf_cnpj: '11.222.333/0001-44',
    kanban_stage_id: null,
    consultation_stage: 'Negociação',
    status: 'Active',
    budget: 50000,
    client_sector: 'Tecnologia',
    responsible_user: null,
    tags: ['tecnologia', 'negociacao'],
    notes: 'Startup de tecnologia em fase de crescimento',
    user_id: '00000000-0000-0000-0000-000000000000'
  },
  {
    name: 'Ana Oliveira',
    email: 'ana.oliveira@email.com',
    phone: '(11) 99999-4444',
    client_name: 'Oliveira Educação',
    client_type: 'pessoa-juridica',
    cpf_cnpj: '55.666.777/0001-88',
    kanban_stage_id: null,
    consultation_stage: 'Fechado',
    status: 'Active',
    budget: 30000,
    client_sector: 'Educação',
    responsible_user: null,
    tags: ['fechado', 'educacao'],
    notes: 'Instituição de ensino que fechou contrato',
    user_id: '00000000-0000-0000-0000-000000000000'
  },
  {
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@email.com',
    phone: '(11) 99999-5555',
    client_name: 'Ferreira Comércio',
    client_type: 'pessoa-juridica',
    cpf_cnpj: '99.888.777/0001-66',
    kanban_stage_id: null,
    consultation_stage: 'Perdido',
    status: 'Inactive',
    budget: 10000,
    client_sector: 'Comércio',
    responsible_user: null,
    tags: ['perdido', 'comercio'],
    notes: 'Cliente que não avançou no processo',
    loss_reason: 'Preço muito alto',
    user_id: '00000000-0000-0000-0000-000000000000'
  }
];

async function insertSampleClients() {
  try {
    console.log('Conectando ao Supabase...');
    console.log('URL:', supabaseUrl);
    
    // Gerar um user_id válido (UUID v4)
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // UUID fixo para teste
    
    // Atualizar todos os clientes com o user_id correto
    const clientsWithUserId = sampleClients.map(client => ({
      ...client,
      user_id: userId
    }));

    // Inserir os clientes diretamente (sem tentar desabilitar RLS)
    console.log('Inserindo clientes de exemplo...');
    const { data, error } = await supabase
      .from('contacts')
      .insert(clientsWithUserId)
      .select();

    if (error) {
      console.error('Erro ao inserir clientes:', error);
      console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('Clientes inseridos com sucesso!');
    console.log(`Total de clientes inseridos: ${data.length}`);
    data.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name} - ${client.email}`);
    });

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a função
insertSampleClients();