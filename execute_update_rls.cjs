require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const sql = fs.readFileSync(path.join(__dirname, 'update_rls.sql'), 'utf8');

async function executeSql() {
  console.log('Executing SQL script...');

  const { error } = await supabase.sql(sql);

  if (error) {
    console.error('Error executing SQL:', error.message);
  } else {
    console.log('Successfully executed SQL script.');
  }
}

executeSql();