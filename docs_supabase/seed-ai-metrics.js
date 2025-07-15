// Script para criar dados de métricas de IA
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para gerar UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Função para gerar data aleatória
function randomDate(start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

// Função para gerar número aleatório
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para escolher item aleatório
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Criar dados para ai_stages
async function seedAIStages() {
  console.log('Criando etapas de IA...');
  
  const stages = [
    {
      name: 'Qualificação Inicial',
      description: 'Etapa para qualificar leads iniciais através de perguntas básicas',
      trigger_conditions: JSON.stringify({type: 'primeira_mensagem', conditions: ['first_contact']}),
      actions: JSON.stringify(['Fazer perguntas de qualificação', 'Identificar interesse', 'Categorizar lead']),
      stage_order: 1,
      is_active: true,
      is_final_stage: false,
      timeout_minutes: 30
    },
    {
      name: 'Apresentação de Soluções',
      description: 'Apresentar soluções adequadas baseadas na qualificação',
      trigger_conditions: JSON.stringify({type: 'lead_qualificado', conditions: ['qualification_complete']}),
      actions: JSON.stringify(['Apresentar produtos/serviços', 'Explicar benefícios', 'Mostrar casos de sucesso']),
      stage_order: 2,
      is_active: true,
      is_final_stage: false,
      timeout_minutes: 60
    },
    {
      name: 'Tratamento de Objeções',
      description: 'Lidar com dúvidas e objeções do cliente',
      trigger_conditions: JSON.stringify({type: 'cliente_com_duvidas', conditions: ['objections_raised']}),
      actions: JSON.stringify(['Escutar objeções', 'Fornecer esclarecimentos', 'Reforçar valor']),
      stage_order: 3,
      is_active: true,
      is_final_stage: false,
      timeout_minutes: 90
    },
    {
      name: 'Fechamento',
      description: 'Finalizar a venda ou agendar próximos passos',
      trigger_conditions: JSON.stringify({type: 'objecoes_resolvidas', conditions: ['ready_to_close']}),
      actions: JSON.stringify(['Propor fechamento', 'Agendar reunião', 'Enviar proposta']),
      stage_order: 4,
      is_active: true,
      is_final_stage: false,
      timeout_minutes: 120
    },
    {
      name: 'Pós-Venda',
      description: 'Acompanhamento e suporte pós-venda',
      trigger_conditions: JSON.stringify({type: 'venda_realizada', conditions: ['sale_completed']}),
      actions: JSON.stringify(['Acompanhar implementação', 'Oferecer suporte', 'Identificar upsell']),
      stage_order: 5,
      is_active: true,
      is_final_stage: true,
      timeout_minutes: 180
    }
  ];
  
  const { data, error } = await supabase.from('ai_stages').insert(stages);
  
  if (error) {
    console.error('Erro ao inserir ai_stages:', error.message);
  } else {
    console.log(`Inseridas ${stages.length} etapas de IA`);
  }
  
  return stages;
}

// Criar dados para ai_personality_settings
async function seedAIPersonality() {
  console.log('Criando personalidades de IA...');
  
  const personalities = [
    {
      name: 'Consultor Profissional',
      personality_type: 'consultative',
      description: 'Personalidade focada em consultoria empresarial, formal mas acessível',
      tone: 'professional',
      response_style: 'detailed',
      greeting_message: 'Olá! Sou seu consultor especializado. Como posso ajudá-lo a otimizar seus processos hoje?',
      custom_instructions: 'Sempre mantenha um tom profissional, mas acessível. Faça perguntas específicas para entender o contexto empresarial.',
      system_prompt: 'Você é um consultor especializado em soluções empresariais. Tenho experiência em análise de negócios e sempre busco entender profundamente as necessidades dos clientes para oferecer as melhores soluções.',
      max_tokens: 500,
      temperature: 0.7,
      language: 'pt-BR',
      fallback_responses: JSON.stringify(['Posso ajudá-lo com mais alguma coisa?', 'Tem alguma dúvida específica sobre nossa solução?']),
      is_active: true
    },
    {
      name: 'Vendedor Amigável',
      personality_type: 'friendly',
      description: 'Personalidade mais descontraída e próxima, focada em relacionamento',
      tone: 'warm',
      response_style: 'conversational',
      greeting_message: 'Oi! Que bom te conhecer! Sou o assistente que vai te ajudar a encontrar a solução perfeita. Como você está?',
      custom_instructions: 'Use uma linguagem mais informal e próxima. Demonstre interesse genuíno pela pessoa e sua situação.',
      system_prompt: 'Você é uma pessoa comunicativa e empática, que acredita que os melhores negócios nascem de relacionamentos genuínos. Gosto de conhecer as pessoas e entender suas histórias.',
      max_tokens: 300,
      temperature: 0.8,
      language: 'pt-BR',
      fallback_responses: JSON.stringify(['Como posso te ajudar melhor? 😊', 'Tem mais alguma coisa que posso fazer por você?']),
      is_active: true
    },
    {
      name: 'Especialista Técnico',
      personality_type: 'technical',
      description: 'Personalidade focada em aspectos técnicos e detalhes da solução',
      tone: 'professional',
      response_style: 'precise',
      greeting_message: 'Olá. Sou o especialista técnico responsável por sua implementação. Vamos analisar os requisitos técnicos?',
      custom_instructions: 'Foque em detalhes técnicos, especificações e aspectos de implementação. Use terminologia técnica apropriada.',
      system_prompt: 'Você é especialista em implementações técnicas e integração de sistemas. Tenho conhecimento profundo sobre arquiteturas, APIs e processos de desenvolvimento.',
      max_tokens: 800,
      temperature: 0.3,
      language: 'pt-BR',
      fallback_responses: JSON.stringify(['Precisa de mais detalhes técnicos?', 'Posso explicar melhor algum aspecto da implementação?']),
      is_active: true
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('ai_personality_settings')
      .insert(personalities);

    if (error) {
      console.error('Erro ao inserir personalidades de IA:', error);
    } else {
      console.log(`✅ ${personalities.length} personalidades de IA criadas com sucesso!`);
    }
  } catch (error) {
    console.error('Erro ao criar personalidades de IA:', error);
  }

  return personalities;
}





// Função principal para executar todo o seeding
async function seedAIDatabase() {
  console.log('🚀 Iniciando seeding do banco de dados de IA...');
  
  try {
    const aiStages = await seedAIStages();
    const aiPersonality = await seedAIPersonality();
    
    console.log('\n=== RESUMO ===');
    console.log(`Etapas de IA: ${aiStages.length}`);
    console.log(`Personalidades de IA: ${aiPersonality.length}`);
    console.log('\n🎉 Seeding de IA concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o seeding de IA:', error);
  } finally {
    process.exit(0);
  }
}

// Executar o seeding
seedAIDatabase();