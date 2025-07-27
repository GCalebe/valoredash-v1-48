// Usar configuração centralizada do Supabase com Service Role Key
const { createSupabaseAdmin } = require('./src/config/supabase-config.cjs');

// Criar cliente administrativo com service role key
const admin = createSupabaseAdmin();
const supabase = admin.client;

console.log('=== MIGRAÇÃO: AI_PRODUCTS → PRODUCTS ===');
console.log('✅ Configuração centralizada carregada');
console.log('🔑 Service Role Key:', admin.isUsingServiceRole() ? 'ATIVA' : 'NÃO ENCONTRADA');

if (!admin.isUsingServiceRole()) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY é obrigatória para esta migração');
  console.error('⚠️  Operações podem falhar devido às políticas RLS');
  process.exit(1);
}

async function executeMigration() {
  console.log('🚀 Iniciando migração: ai_products → products');
  console.log('=' .repeat(50));

  try {
    // 1. Verificar dados atuais
    console.log('📊 Verificando dados atuais...');
    
    const { data: aiProductsData, error: aiProductsError } = await supabase
      .from('ai_products')
      .select('*');
    
    if (aiProductsError) {
      console.error('❌ Erro ao buscar ai_products:', aiProductsError);
      return;
    }
    
    console.log(`📦 Encontrados ${aiProductsData?.length || 0} produtos em ai_products`);
    
    // 2. Verificar se a tabela products já existe
    const { data: existingProducts, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (!productsError) {
      console.log('⚠️  Tabela products já existe');
      const { count: productsCount } = await supabase
        .from('products')
        .select('id', { count: 'exact' });
      console.log(`📦 Produtos existentes na tabela products: ${productsCount || 0}`);
    }
    
    // 3. Executar migração manual (sem SQL complexo)
    console.log('\n📝 Executando migração manual...');
    console.log(`🔑 Usando chave: ${admin.isUsingServiceRole() ? 'Service Role' : 'Anon Key'}`);
    
    if (!admin.isUsingServiceRole()) {
      console.log('⚠️  AVISO: Usando chave anônima. Algumas operações podem falhar devido ao RLS.');
    }
    
    // Primeiro, tentar criar a tabela products se não existir
    console.log('🔧 Verificando/criando tabela products...');
    
    // Migrar dados de ai_products para products
    console.log('📦 Migrando dados de ai_products para products...');
    
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
        // Campos novos com valores padrão
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
      
      const { error: insertError } = await supabase
        .from('products')
        .upsert(productData, { onConflict: 'id' });
      
      if (insertError) {
        console.warn(`⚠️  Erro ao migrar produto ${product.name}:`, insertError.message);
      } else {
        console.log(`   ✅ ${product.name} migrado`);
      }
    }
    
    // 4. Verificar migração
    console.log('\n✅ Verificando migração...');
    
    const { data: migratedProducts, error: verifyError } = await supabase
      .from('products')
      .select('*');
    
    if (verifyError) {
      console.error('❌ Erro ao verificar produtos migrados:', verifyError);
      return;
    }
    
    console.log(`✅ Migração concluída! ${migratedProducts.length} produtos na tabela products`);
    
    // 5. Comparar dados
    console.log('\n📋 Comparação de dados:');
    console.log(`   ai_products: ${aiProductsData.length} registros`);
    console.log(`   products: ${migratedProducts.length} registros`);
    
    if (aiProductsData.length === migratedProducts.length) {
      console.log('✅ Todos os produtos foram migrados com sucesso!');
    } else {
      console.log('⚠️  Diferença no número de registros - verificar manualmente');
    }
    
    // 6. Mostrar exemplo dos dados migrados
    console.log('\n📄 Exemplo de produto migrado:');
    if (migratedProducts.length > 0) {
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
    
    console.log('\n🎉 Migração concluída com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Atualizar o código para usar a tabela "products" ao invés de "ai_products"');
    console.log('   2. Testar todas as funcionalidades');
    console.log('   3. Após confirmação, considerar backup/remoção da tabela ai_products');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  }
}

// Executar migração
if (require.main === module) {
  executeMigration();
}

module.exports = { executeMigration };