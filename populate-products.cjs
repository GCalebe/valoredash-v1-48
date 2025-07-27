// Script para popular o banco com 10 produtos realistas
const { createSupabaseAdmin } = require('./src/config/supabase-config.cjs');

// Criar cliente administrativo com service role key
const admin = createSupabaseAdmin();
const supabase = admin.client;

console.log('=== POPULANDO BANCO COM PRODUTOS REALISTAS ===');
console.log('✅ Configuração centralizada carregada');
console.log('🔑 Service Role Key:', admin.isUsingServiceRole() ? 'ATIVA' : 'NÃO ENCONTRADA');

if (!admin.isUsingServiceRole()) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY é obrigatória para esta operação');
  process.exit(1);
}

// Produtos realistas para popular o banco
const products = [
  {
    name: 'ChatBot Vendas Pro',
    description: 'Chatbot inteligente especializado em vendas e conversão de leads',
    features: ['Qualificação automática de leads', 'Integração com CRM', 'Relatórios de conversão', 'Respostas personalizadas'],
    category: 'vendas',
    popular: true,
    new: false,
    icon: '🤖',
    image: null,
    price: 297.00,
    benefits: ['Aumento de 40% na conversão', 'Atendimento 24/7', 'Redução de custos operacionais'],
    objections: null,
    differentials: ['IA treinada especificamente para vendas', 'Integração nativa com principais CRMs'],
    success_cases: null,
    has_combo: true,
    has_upgrade: true,
    has_promotion: false
  },
  {
    name: 'Assistente Marketing Digital',
    description: 'IA especializada em criação de conteúdo e estratégias de marketing',
    features: ['Criação de posts', 'Planejamento de campanhas', 'Análise de concorrência', 'SEO automático'],
    category: 'marketing',
    popular: true,
    new: true,
    icon: '📱',
    image: null,
    price: 197.00,
    benefits: ['Economia de 80% no tempo de criação', 'Conteúdo otimizado para conversão', 'Análises detalhadas'],
    objections: null,
    differentials: ['Base de dados atualizada diariamente', 'Templates exclusivos'],
    success_cases: null,
    has_combo: false,
    has_upgrade: true,
    has_promotion: true
  },
  {
    name: 'Suporte Técnico IA',
    description: 'Sistema de suporte automatizado com resolução inteligente de problemas',
    features: ['Diagnóstico automático', 'Base de conhecimento', 'Escalação inteligente', 'Tickets automáticos'],
    category: 'suporte',
    popular: false,
    new: false,
    icon: '🛠️',
    image: null,
    price: 147.00,
    benefits: ['Redução de 60% no tempo de resolução', 'Satisfação do cliente aumentada', 'Menor carga de trabalho'],
    objections: null,
    differentials: ['Integração com principais ferramentas de suporte', 'Aprendizado contínuo'],
    success_cases: null,
    has_combo: true,
    has_upgrade: false,
    has_promotion: false
  },
  {
    name: 'Consultor Financeiro Virtual',
    description: 'IA especializada em consultoria financeira e planejamento',
    features: ['Análise de investimentos', 'Planejamento financeiro', 'Alertas de mercado', 'Relatórios personalizados'],
    category: 'financeiro',
    popular: true,
    new: true,
    icon: '💰',
    image: null,
    price: 397.00,
    benefits: ['Decisões financeiras mais assertivas', 'Economia de taxas de consultoria', 'Análises em tempo real'],
    objections: null,
    differentials: ['Dados de mercado em tempo real', 'Algoritmos proprietários de análise'],
    success_cases: null,
    has_combo: true,
    has_upgrade: true,
    has_promotion: false
  },
  {
    name: 'Recrutador Inteligente',
    description: 'Sistema de recrutamento automatizado com análise de perfis',
    features: ['Triagem de currículos', 'Entrevistas automatizadas', 'Análise de fit cultural', 'Relatórios de candidatos'],
    category: 'rh',
    popular: false,
    new: true,
    icon: '👥',
    image: null,
    price: 247.00,
    benefits: ['Redução de 70% no tempo de recrutamento', 'Melhor qualidade de contratações', 'Processo padronizado'],
    objections: null,
    differentials: ['IA treinada em milhares de processos seletivos', 'Integração com LinkedIn'],
    success_cases: null,
    has_combo: false,
    has_upgrade: true,
    has_promotion: true
  },
  {
    name: 'Tutor Educacional IA',
    description: 'Assistente educacional personalizado para aprendizado adaptativo',
    features: ['Planos de estudo personalizados', 'Exercícios adaptativos', 'Acompanhamento de progresso', 'Gamificação'],
    category: 'educacao',
    popular: true,
    new: false,
    icon: '📚',
    image: null,
    price: 97.00,
    benefits: ['Aprendizado 50% mais eficiente', 'Motivação aumentada', 'Resultados mensuráveis'],
    objections: null,
    differentials: ['Metodologia baseada em neurociência', 'Conteúdo sempre atualizado'],
    success_cases: null,
    has_combo: true,
    has_upgrade: false,
    has_promotion: false
  },
  {
    name: 'Analista de Dados Pro',
    description: 'IA para análise avançada de dados e geração de insights',
    features: ['Análise preditiva', 'Visualizações automáticas', 'Relatórios executivos', 'Alertas inteligentes'],
    category: 'analytics',
    popular: false,
    new: true,
    icon: '📊',
    image: null,
    price: 497.00,
    benefits: ['Insights 10x mais rápidos', 'Decisões baseadas em dados', 'ROI mensurável'],
    objections: null,
    differentials: ['Algoritmos de machine learning avançados', 'Integração com 100+ fontes de dados'],
    success_cases: null,
    has_combo: true,
    has_upgrade: true,
    has_promotion: false
  },
  {
    name: 'Assistente Jurídico Digital',
    description: 'IA especializada em análise de documentos e pesquisa jurídica',
    features: ['Análise de contratos', 'Pesquisa jurisprudencial', 'Geração de petições', 'Alertas de prazos'],
    category: 'juridico',
    popular: false,
    new: false,
    icon: '⚖️',
    image: null,
    price: 597.00,
    benefits: ['Redução de 80% no tempo de pesquisa', 'Maior precisão jurídica', 'Compliance automatizado'],
    objections: null,
    differentials: ['Base jurídica sempre atualizada', 'Validação por especialistas'],
    success_cases: null,
    has_combo: false,
    has_upgrade: true,
    has_promotion: true
  },
  {
    name: 'Designer Criativo IA',
    description: 'Ferramenta de design automatizado para criação de materiais visuais',
    features: ['Geração de layouts', 'Paletas de cores inteligentes', 'Tipografia automática', 'Adaptação multi-formato'],
    category: 'design',
    popular: true,
    new: true,
    icon: '🎨',
    image: null,
    price: 197.00,
    benefits: ['Criação 5x mais rápida', 'Designs profissionais', 'Consistência visual'],
    objections: null,
    differentials: ['IA treinada em milhões de designs', 'Tendências sempre atualizadas'],
    success_cases: null,
    has_combo: true,
    has_upgrade: false,
    has_promotion: false
  },
  {
    name: 'Gestor de Projetos Virtual',
    description: 'IA para gerenciamento inteligente de projetos e equipes',
    features: ['Planejamento automático', 'Alocação de recursos', 'Monitoramento de riscos', 'Relatórios de performance'],
    category: 'gestao',
    popular: false,
    new: false,
    icon: '📋',
    image: null,
    price: 347.00,
    benefits: ['Projetos 30% mais rápidos', 'Redução de riscos', 'Equipes mais produtivas'],
    objections: null,
    differentials: ['Metodologias ágeis integradas', 'Previsão de problemas'],
    success_cases: null,
    has_combo: true,
    has_upgrade: true,
    has_promotion: false
  }
];

async function populateProducts() {
  try {
    console.log('🗑️  Excluindo produtos existentes...');
    
    // Excluir todos os produtos existentes
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos exceto um ID impossível
    
    if (deleteError) {
      console.error('❌ Erro ao excluir produtos:', deleteError);
      return;
    }
    
    console.log('✅ Produtos existentes excluídos');
    
    console.log('📦 Inserindo 10 produtos realistas...');
    
    // Inserir os novos produtos
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productData = {
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null
      };
      
      const { error: insertError } = await supabase
        .from('products')
        .insert(productData);
      
      if (insertError) {
        console.error(`❌ Erro ao inserir produto ${product.name}:`, insertError);
      } else {
        console.log(`   ✅ ${i + 1}/10 - ${product.name} inserido`);
      }
    }
    
    // Verificar inserção
    const { data: insertedProducts, error: verifyError } = await supabase
      .from('products')
      .select('id, name, category, price, popular, new')
      .order('created_at', { ascending: false });
    
    if (verifyError) {
      console.error('❌ Erro ao verificar produtos inseridos:', verifyError);
      return;
    }
    
    console.log('\n✅ Produtos inseridos com sucesso!');
    console.log(`📊 Total de produtos no banco: ${insertedProducts.length}`);
    
    console.log('\n📋 Resumo dos produtos inseridos:');
    insertedProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.category}) - R$ ${product.price || 'Grátis'}${product.popular ? ' 🔥' : ''}${product.new ? ' 🆕' : ''}`);
    });
    
    console.log('\n🎉 Banco de dados populado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a operação:', error);
  }
}

// Executar população
if (require.main === module) {
  populateProducts();
}

module.exports = { populateProducts };