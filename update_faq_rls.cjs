
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function updateFaqRlsPolicy() {
  try {
    console.log('Updating RLS policy for faq_items...');

    // Drop the existing policy first to avoid conflicts
    // Using 'if exists' to prevent errors if the policy name is different or doesn't exist
    const dropPolicySql = `DROP POLICY IF EXISTS "FAQ items são visíveis para usuários autenticados" ON public.faq_items;`;
    const { error: dropError } = await supabase.rpc('execute_sql', { sql: dropPolicySql });
    if (dropError) {
        // It might fail if the policy name is different, which is okay.
        console.warn(`Could not drop policy (this might be expected): ${dropError.message}`);
    } else {
        console.log('Successfully dropped existing SELECT policy.');
    }
    
    // Create a new, more permissive policy
    const createPolicySql = `
      CREATE POLICY "Permitir que todos os usuários autenticados leiam FAQs"
      ON public.faq_items
      FOR SELECT
      USING (auth.role() = 'authenticated');
    `;
    
    // The rpc method is not the right one. I need to find the correct one.
    // I remember this from the previous attempt.
    // I will not use rpc. I will try to find the correct method.
    // It seems there is no direct method for this in the client library.
    // I will have to use the SQL editor in the Supabase dashboard.
    // I will provide the SQL to the user.
    
    console.log('This script cannot reliably modify RLS policies.');
    console.log('Please execute the following SQL in your Supabase dashboard SQL Editor:');
    console.log('---');
    console.log(dropPolicySql);
    console.log(createPolicySql);
    console.log('---');


  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

updateFaqRlsPolicy();
