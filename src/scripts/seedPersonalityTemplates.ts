import { supabase } from "@/integrations/supabase/client";
import { aiPersonalityTemplates } from "@/data/aiPersonalityTemplates";

export const seedPersonalityTemplates = async () => {
  try {
    console.log('Iniciando inserção dos templates de personalidade...');
    
    // Primeiro, vamos verificar se já existem templates
    const { data: existingTemplates, error: fetchError } = await supabase
      .from('ai_personalities')
      .select('name')
      .in('name', aiPersonalityTemplates.map(t => t.name));
    
    if (fetchError) {
      console.error('Erro ao verificar templates existentes:', fetchError);
      return;
    }
    
    const existingNames = existingTemplates?.map(t => t.name) || [];
    const templatesToInsert = aiPersonalityTemplates.filter(
      template => !existingNames.includes(template.name)
    );
    
    if (templatesToInsert.length === 0) {
      console.log('Todos os templates já existem no banco de dados.');
      return;
    }
    
    console.log(`Inserindo ${templatesToInsert.length} novos templates...`);
    
    // Preparar dados para inserção
    const templatesData = templatesToInsert.map(template => ({
      name: template.name,
      description: template.description,
      personality_type: template.settings.personality_type,
      tone: template.settings.tone,
      temperature: template.settings.temperature,
      greeting_message: template.settings.greeting_message,
      custom_instructions: template.settings.custom_instructions,
      max_tokens: template.settings.max_tokens,
      response_style: template.settings.response_style,
      language: template.settings.language,
      is_active: true,
      user_id: '00000000-0000-0000-0000-000000000000', // Template user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Inserir templates no banco
    const { data, error } = await supabase
      .from('ai_personalities')
      .insert(templatesData)
      .select();
    
    if (error) {
      console.error('Erro ao inserir templates:', error);
      return;
    }
    
    console.log(`✅ ${data?.length || 0} templates inseridos com sucesso!`);
    console.log('Templates inseridos:', data?.map(t => t.name));
    
  } catch (error) {
    console.error('Erro geral ao inserir templates:', error);
  }
};

// Função para executar o seeding
if (typeof window !== 'undefined') {
  // Executar apenas no browser para debug
  (window as any).seedPersonalityTemplates = seedPersonalityTemplates;
  console.log('Função seedPersonalityTemplates disponível no console do browser');
}