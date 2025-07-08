// Script de verificação pós-migração
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const expectedTables = [
  'calendar_events', 'calendar_attendees', 'appointments',
  'pricing_plans', 'user_subscriptions', 'payment_methods', 'invoices',
  'monthly_growth', 'conversation_daily_data', 'conversion_by_time',
  'leads_by_source', 'leads_over_time', 'campaign_data', 'conversations'
];

async function verifyMigration() {
  console.log('🔍 Verificando migração...');
  
  let success = 0;
  let failed = 0;
  
  for (const table of expectedTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.message.includes('does not exist')) {
        console.log(`❌ ${table} - NÃO EXISTE`);
        failed++;
      } else {
        console.log(`✅ ${table} - OK`);
        success++;
      }
    } catch (err) {
      console.log(`❌ ${table} - ERRO: ${err.message}`);
      failed++;
    }
  }
  
  console.log(`
📊 Resultado: ${success} OK, ${failed} com problemas`);
  
  if (failed === 0) {
    console.log('🎉 Migração concluída com sucesso!');
  } else {
    console.log('⚠️  Algumas tabelas ainda precisam ser criadas.');
  }
}

verifyMigration().catch(console.error);