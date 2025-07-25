require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('=== TESTE DE INSERÇÃO DE CLIENTES ===');
console.log('Supabase URL:', supabaseUrl ? 'Configurado' : 'NÃO ENCONTRADO');
console.log('Supabase Key:', supabaseKey ? 'Configurado' : 'NÃO ENCONTRADO');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente de teste simples
const testClient = {
  name: 'Cliente Teste',
  email: 'teste@exemplo.com',
  phone: '(11) 99999-0000',
  client_name: 'Empresa Teste',
  user_id: '550e8400-e29b-41d4-a716-446655440000'
};

async function testInsert() {
  try {
    console.log('\n🔄 Tentando inserir cliente de teste...');
    console.log('Dados do cliente:', JSON.stringify(testClient, null, 2));
    
    const { data, error } = await supabase
      .from('contacts')
      .insert([testClient])
      .select();

    if (error) {
      console.error('❌ Erro ao inserir cliente:');
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
      return false;
    }

    console.log('✅ Cliente inserido com sucesso!');
    console.log('Dados retornados:', JSON.stringify(data, null, 2));
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return false;
  }
}

// Executar teste
testInsert().then(success => {
  if (success) {
    console.log('\n🎉 Teste concluído com sucesso!');
  } else {
    console.log('\n💥 Teste falhou!');
  }
  process.exit(success ? 0 : 1);
});