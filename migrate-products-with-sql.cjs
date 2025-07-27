require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== MIGRAÇÃO: AI_PRODUCTS → PRODUCTS (SQL) ===');
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

async function executeSQLMigration() {
  console.log('\n🚀 Iniciando migração SQL...');
  console.log(`🔑 Usando chave: ${supabaseServiceKey ? 'Service Role' : 'Anon Key'}`);
  
  try {
    // 1. Verificar dados atuais
    console.log('\n📊 Verificando dados atuais...');
    
    const { data: aiProductsData, error: aiProductsError } = await supabase
      .from('ai_products')
      .select('*');
    
    if (aiProductsError) {
      console.error('❌ Erro ao buscar ai_products:', aiProductsError);
      return;
    }
    
    console.log(`📦 Encontrados ${aiProductsData.length} produtos em ai_products`);
    
    // 2. Executar migração via SQL direto
    console.log('\n📝 Executando migração via SQL...');
    
    const migrationSQL = `
      -- Inserir dados de ai_products em products
      INSERT INTO public.products (
        id, name, description, features, category, popular, new, icon, image, created_at,
        price, benefits, objections, differentials, success_cases, 
        has_combo, has_upgrade, has_promotion, updated_at, created_by
      )
      SELECT 
        id, name, description, features, category, 
        COALESCE(popular, false), COALESCE(new, false), icon, image, created_at,
        NULL as price, NULL as benefits, NULL as objections, NULL as differentials, NULL as success_cases,
        false as has_combo, false as has_upgrade, false as has_promotion,
        NOW() as updated_at, NULL as created_by
      FROM public.ai_products
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        features = EXCLUDED.features,
        category = EXCLUDED.category,
        popular = EXCLUDED.popular,
        new = EXCLUDED.new,
        icon = EXCLUDED.icon,
        image = EXCLUDED.image,
        updated_at = NOW();
    `;
    
    const { data: sqlResult, error: sqlError } = await supabase
      .rpc('exec_sql', { sql: migrationSQL });
    
    if (sqlError) {
      console.log('⚠️  RPC exec_sql não disponível, tentando abordagem alternativa...');
      
      // Abordagem alternativa: migração manual com bypass de RLS
      console.log('🔄 Tentando migração manual...');
      
      for (const product of aiProductsData) {
        const productData = {
          id: product.id,
          name: product.name,
          description: product.description,
          features: product.features,
          category: product.category,
          popular: product.popular || false,
          new: product.new || false,
          icon: product.icon,
          image: product.image,
          created_at: product.created_at,
          price: null,
          benefits: null,
          objections: null,
          differentials: null,
          success_cases: null,
          has_combo: false,
          has_upgrade: false,
          has_promotion: false,
          updated_at: new Date().toISOString(),
          created_by: null
        };
        
        // Tentar inserir diretamente
        const { error: insertError } = await supabase
          .from('products')
          .upsert(productData, { onConflict: 'id' });
        
        if (insertError) {
          console.warn(`⚠️  Erro ao migrar ${product.name}:`, insertError.message);
        } else {
          console.log(`   ✅ ${product.name} migrado`);
        }
      }
    } else {
      console.log('✅ Migração SQL executada com sucesso!');
    }
    
    // 3. Verificar resultado
    console.log('\n✅ Verificando migração...');
    
    const { data: migratedProducts, error: verifyError } = await supabase
      .from('products')
      .select('*');
    
    if (verifyError) {
      console.error('❌ Erro ao verificar produtos migrados:', verifyError);
      return;
    }
    
    console.log(`✅ Migração concluída! ${migratedProducts.length} produtos na tabela products`);
    
    // 4. Comparar dados
    console.log('\n📋 Comparação de dados:');
    console.log(`   ai_products: ${aiProductsData.length} registros`);
    console.log(`   products: ${migratedProducts.length} registros`);
    
    if (aiProductsData.length === migratedProducts.length) {
      console.log('✅ Todos os produtos foram migrados com sucesso!');
    } else {
      console.log('⚠️  Diferença no número de registros');
      
      if (migratedProducts.length === 0) {
        console.log('\n💡 SOLUÇÃO PARA RLS:');
        console.log('Execute este SQL no Supabase SQL Editor:');
        console.log('\n```sql');
        console.log(migrationSQL);
        console.log('```');
      }
    }
    
    // 5. Mostrar exemplo dos dados migrados
    if (migratedProducts.length > 0) {
      console.log('\n📄 Exemplo de produto migrado:');
      const example = migratedProducts[0];
      console.log(JSON.stringify({
        id: example.id,
        name: example.name,
        category: example.category,
        features: example.features,
        popular: example.popular,
        new: example.new,
        created_at: example.created_at
      }, null, 2));
    }
    
    console.log('\n🎉 Processo de migração concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  }
}

// Executar migração
if (require.main === module) {
  executeSQLMigration();
}

module.exports = { executeSQLMigration };