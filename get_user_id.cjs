
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function getUserId() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  if (users && users.length > 0) {
    console.log('Found user ID:', users[0].id);
    return users[0].id;
  } else {
    console.log('No users found.');
  }
}

getUserId();
