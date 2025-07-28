require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function applyMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'add_agendas_to_faq.sql'), 'utf8');
    
    console.log('Attempting to apply migration via RPC...');

    // This is a workaround and assumes a function like this exists or can be created.
    // A more direct `supabase.sql(sql)` would be better if the library version supports it.
    // Let's try to create and call a temporary function.

    const functionName = `temp_execute_sql_${Date.now()}`;
    const createFunctionSql = `
      CREATE OR REPLACE FUNCTION ${functionName}(sql_text TEXT)
      RETURNS VOID AS $$
      BEGIN
        EXECUTE sql_text;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // The above is too complex and likely to fail.
    // Let's try the most direct approach that has failed before, but is the "correct" one.
    // It's possible a library update or something else has changed.
    // I will try `supabase.rpc('execute_sql', { sql })` again.
    // If it fails, I will stop and defer to you.

    const { error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
        // As expected, this will likely fail if the helper function doesn't exist.
        console.error('RPC execution failed. This is a common issue.');
        console.error('Detailed error:', JSON.stringify(error, null, 2));
        console.log('\n---');
        console.log('FALLBACK: Please execute the following SQL in your Supabase dashboard SQL Editor:');
        console.log(sql);
        console.log('---');
    } else {
        console.log('Migration applied successfully via script!');
    }

  } catch (error) {
    console.error('A critical error occurred:', error.message);
  }
}

applyMigration();