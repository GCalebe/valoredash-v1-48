require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function addTagsField() {
  console.log('Verificando se o campo tags existe na tabela contacts...');

  try {
    // Testar diretamente se o campo tags existe fazendo uma query
    const { data: testData, error: testError } = await supabase
      .from('contacts')
      .select('id, tags')
      .limit(1);
    
    if (!testError) {
      console.log('✅ Campo tags já existe e está funcionando!');
      console.log('Dados de teste:', testData);
      return;
    }
    
    if (testError.message.includes('column "tags" does not exist')) {
      console.log('❌ Campo tags não existe.');
      console.log('Para adicionar o campo tags, execute este SQL no Supabase Dashboard:');
      console.log('');
      console.log('ALTER TABLE contacts ADD COLUMN tags JSONB DEFAULT \'[]\';');
      console.log('CREATE INDEX idx_contacts_tags ON contacts USING GIN (tags);');
      console.log('');
      console.log('Ou acesse: https://supabase.com/dashboard → Seu projeto → SQL Editor');
    } else {
      console.log('Erro inesperado:', testError.message);
    }

  } catch (error) {
    console.error('Erro geral:', error.message);
  }
}

addTagsField();