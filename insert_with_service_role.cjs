require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== INSERÇÃO DE CLIENTES DE EXEMPLO ===');
console.log('Supabase URL:', supabaseUrl ? 'Configurado' : 'NÃO ENCONTRADO');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Configurado' : 'NÃO ENCONTRADO');
console.log('Supabase Service Key:', supabaseServiceKey ? 'Configurado' : 'NÃO ENCONTRADO');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

// Usar service role key se disponível, senão usar anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const sampleClients = [
  {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1111',
    client_name: 'Silva Consultoria',
    client_type: 'pessoa-juridica',
    cpf_cnpj: '12.345.678/0001-90',
    consultation_stage: 'Agendamento',
    status: 'Active',
    budget: 15000,
    client_sector: 'Consultoria',
    tags: ['novo-cliente', 'consultoria'],
    notes: 'Cliente interessado em consultoria empresarial'
  },
  {
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 99999-2222',
    client_name: 'Santos & Associados',
    client_type: 'pessoa-juridica',
    cpf_cnpj: '98.765.432/0001-10',
    consultation_stage: 'Proposta',
    status: 'Active',
    budget: 25000,
    client_sector: 'Advocacia',
    tags: ['qualificado', 'advocacia'],
    notes: 'Escritório de advocacia interessado em automação'
  },
  {
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    phone: '(11) 99999-3333',
    client_name: 'Costa Tech',
    client_type: 'pessoa-juridica',
    cpf_cnpj: '11.222.333/0001-44',
    consultation_stage: 'Negociação',
    status: 'Active',
    budget: 50000,
    client_sector: 'Tecnologia',
    tags: ['tecnologia', 'negociacao'],
    notes: 'Startup de tecnologia em fase de crescimento'
  },
  {
    name: 'Ana Oliveira',
    email: 'ana.oliveira@email.com',
    phone: '(11) 99999-4444',
    client_name: 'Oliveira Educação',
    client_type: 'pessoa-juridica',
    cpf_cnpj: '55.666.777/0001-88',
    consultation_stage: 'Fechado',
    status: 'Active',
    budget: 30000,
    client_sector: 'Educação',
    tags: ['fechado', 'educacao'],
    notes: 'Instituição de ensino que fechou contrato'
  },
  {
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@email.com',
    phone: '(11) 99999-5555',
    client_name: 'Ferreira Comércio',
    client_type: 'pessoa-juridica',
    cpf_cnpj: '99.888.777/0001-66',
    consultation_stage: 'Perdido',
    status: 'Inactive',
    budget: 10000,
    client_sector: 'Comércio',
    tags: ['perdido', 'comercio'],
    notes: 'Cliente que não avançou no processo',
    loss_reason: 'Preço muito alto'
  }
];

async function insertClients() {
  try {
    console.log('\n🔄 Inserindo clientes de exemplo...');
    console.log(`Usando ${supabaseServiceKey ? 'SERVICE ROLE' : 'ANON'} key`);
    
    const { data, error } = await supabase
      .from('contacts')
      .insert(sampleClients)
      .select();

    if (error) {
      console.error('❌ Erro ao inserir clientes:');
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
      
      if (error.code === '42501') {
        console.log('\n💡 SOLUÇÃO:');
        console.log('1. Acesse o Supabase Dashboard');
        console.log('2. Vá para SQL Editor');
        console.log('3. Execute o arquivo insert_sample_clients.sql');
        console.log('4. Ou adicione SUPABASE_SERVICE_ROLE_KEY ao arquivo .env');
      }
      return false;
    }

    console.log('✅ Clientes inseridos com sucesso!');
    console.log(`📊 Total: ${data.length} clientes`);
    
    console.log('\n📋 Clientes inseridos:');
    data.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name} (${client.client_name}) - ${client.consultation_stage}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return false;
  }
}

// Executar inserção
insertClients().then(success => {
  if (success) {
    console.log('\n🎉 Inserção concluída com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('- Verifique os clientes no dashboard do Supabase');
    console.log('- Teste o formulário de inserção na aplicação');
  } else {
    console.log('\n💥 Inserção falhou!');
    console.log('\n🔧 Alternativas:');
    console.log('1. Execute o arquivo insert_sample_clients.sql no Supabase SQL Editor');
    console.log('2. Configure SUPABASE_SERVICE_ROLE_KEY no .env');
    console.log('3. Desabilite temporariamente RLS na tabela contacts');
  }
  process.exit(success ? 0 : 1);
});