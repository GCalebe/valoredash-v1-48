import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkKnowledgeBase() {
  console.log('🔍 Verificando tabela knowledge_base...');
  
  try {
    // Verificar estrutura da tabela
    console.log('\n📋 Contando total de registros:');
    const { count, error: countError } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar registros:', countError);
    } else {
      console.log(`✅ Total de artigos: ${count}`);
    }

    // Buscar alguns registros para ver a estrutura
    console.log('\n📄 Primeiros 5 registros:');
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Erro ao buscar dados:', error);
    } else {
      console.log('✅ Dados encontrados:', data?.length || 0, 'registros');
      if (data && data.length > 0) {
        console.log('\n🔍 Estrutura do primeiro registro:');
        console.log(JSON.stringify(data[0], null, 2));
        
        console.log('\n📊 Campos disponíveis:');
        Object.keys(data[0]).forEach(key => {
          console.log(`- ${key}: ${typeof data[0][key]}`);
        });
      }
    }

    // Verificar registros por status
    console.log('\n📈 Registros por status:');
    const { data: statusData, error: statusError } = await supabase
      .from('knowledge_base')
      .select('status')
      .not('status', 'is', null);
    
    if (statusError) {
      console.error('❌ Erro ao buscar status:', statusError);
    } else {
      const statusCount = {};
      statusData?.forEach(item => {
        statusCount[item.status] = (statusCount[item.status] || 0) + 1;
      });
      console.log(statusCount);
    }

    // Verificar registros por idioma
    console.log('\n🌍 Registros por idioma:');
    const { data: langData, error: langError } = await supabase
      .from('knowledge_base')
      .select('language')
      .not('language', 'is', null);
    
    if (langError) {
      console.error('❌ Erro ao buscar idiomas:', langError);
    } else {
      const langCount = {};
      langData?.forEach(item => {
        langCount[item.language] = (langCount[item.language] || 0) + 1;
      });
      console.log(langCount);
    }

    // Verificar registros públicos
    console.log('\n🔓 Registros públicos vs privados:');
    const { data: publicData, error: publicError } = await supabase
      .from('knowledge_base')
      .select('is_public');
    
    if (publicError) {
      console.error('❌ Erro ao buscar is_public:', publicError);
    } else {
      const publicCount = { true: 0, false: 0, null: 0 };
      publicData?.forEach(item => {
        if (item.is_public === true) publicCount.true++;
        else if (item.is_public === false) publicCount.false++;
        else publicCount.null++;
      });
      console.log(publicCount);
    }

    // Testar query específica que está sendo usada no frontend
    console.log('\n🎯 Testando query do frontend (pt, published, public):');
    const { data: frontendData, error: frontendError } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('language', 'pt')
      .eq('status', 'published')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (frontendError) {
      console.error('❌ Erro na query do frontend:', frontendError);
    } else {
      console.log(`✅ Query do frontend retornou: ${frontendData?.length || 0} registros`);
      if (frontendData && frontendData.length > 0) {
        console.log('\n📝 Títulos dos artigos encontrados:');
        frontendData.forEach((article, index) => {
          console.log(`${index + 1}. ${article.title}`);
        });
      }
    }

  } catch (err) {
    console.error('💥 Erro geral:', err);
  }
}

checkKnowledgeBase();