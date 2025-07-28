
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Function to generate unique FAQ data for a user
const generateFaqsForUser = (userId, userIndex) => {
  return [
    { question: `Qual a política de privacidade para o usuário ${userIndex + 1}?`, answer: `A política de privacidade detalha o uso de dados para o usuário ${userIndex + 1}.`, category: 'Segurança', tags: ['privacidade', `user-${userIndex + 1}`], is_active: true },
    { question: `Como o usuário ${userIndex + 1} altera seu e-mail?`, answer: `O usuário ${userIndex + 1} pode alterar seu e-mail nas configurações de perfil.`, category: 'Conta', tags: ['perfil', `user-${userIndex + 1}`], is_active: true },
    { question: `Quais integrações o usuário ${userIndex + 1} pode usar?`, answer: `As integrações disponíveis para o usuário ${userIndex + 1} estão na seção de "Integrações".`, category: 'Integrações', tags: ['api', `user-${userIndex + 1}`], is_active: true },
    { question: `O usuário ${userIndex + 1} tem um período de teste?`, answer: `Sim, o período de teste para o usuário ${userIndex + 1} é de 14 dias.`, category: 'Assinatura', tags: ['teste', `user-${userIndex + 1}`], is_active: true },
    { question: `Quais os requisitos de sistema para o usuário ${userIndex + 1}?`, answer: `A plataforma funciona em navegadores modernos para o usuário ${userIndex + 1}.`, category: 'Técnico', tags: ['requisitos', `user-${userIndex + 1}`], is_active: true },
    { question: `Como o usuário ${userIndex + 1} exporta seus dados?`, answer: `A exportação de dados para o usuário ${userIndex + 1} está nas configurações.`, category: 'Dados', tags: ['exportar', `user-${userIndex + 1}`], is_active: false }
  ].map(faq => ({
    ...faq,
    created_by: userId,
    user_id: userId, // Including both fields for safety
  }));
};

async function populateFaqsForAllUsers() {
  try {
    // 1. Get all users
    console.log('Fetching all users...');
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      throw new Error(`Could not fetch users: ${userError.message}`);
    }
    if (!users || users.length === 0) {
      throw new Error('No users found. Cannot populate FAQs.');
    }
    
    console.log(`Found ${users.length} users. Preparing to seed 6 FAQs for each.`);

    // 2. Generate all FAQ entries for all users
    let allFaqsToInsert = [];
    users.forEach((user, index) => {
      const userFaqs = generateFaqsForUser(user.id, index);
      allFaqsToInsert.push(...userFaqs);
    });

    if (allFaqsToInsert.length === 0) {
        throw new Error('No FAQs were generated. Aborting.');
    }

    // 3. Insert all data in a single batch
    console.log(`Inserting a total of ${allFaqsToInsert.length} FAQs into the database...`);
    const { data: insertData, error: insertError } = await supabase
      .from('faq_items')
      .insert(allFaqsToInsert)
      .select('id, question, created_by'); // Select only a few fields for cleaner logging

    if (insertError) {
      console.error('Detailed error:', JSON.stringify(insertError, null, 2));
      throw new Error(`Failed to insert FAQs: ${insertError.message}`);
    }

    console.log('Successfully populated FAQs for all users!');
    console.log(`${insertData.length} records created.`);

  } catch (error) {
    console.error('An error occurred during the population process:', error.message);
  }
}

populateFaqsForAllUsers();
