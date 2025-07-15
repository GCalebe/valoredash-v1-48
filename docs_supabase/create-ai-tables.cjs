const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const createAITablesSQL = `
-- Criar tabela ai_personality_settings
CREATE TABLE IF NOT EXISTS ai_personality_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  personality_traits JSONB,
  response_style VARCHAR(100),
  tone VARCHAR(100),
  expertise_areas TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela ai_stages
CREATE TABLE IF NOT EXISTS ai_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stage_order INTEGER NOT NULL,
  personality_id UUID REFERENCES ai_personality_settings(id) ON DELETE CASCADE,
  prompts JSONB,
  conditions JSONB,
  actions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para reordenar estágios
CREATE OR REPLACE FUNCTION reorder_ai_stages()
RETURNS TRIGGER AS $$
BEGIN
  -- Reordenar estágios quando um é inserido ou atualizado
  UPDATE ai_stages 
  SET stage_order = stage_order + 1 
  WHERE personality_id = NEW.personality_id 
    AND stage_order >= NEW.stage_order 
    AND id != NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at em ai_personality_settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_personality_settings_updated_at
  BEFORE UPDATE ON ai_personality_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at em ai_stages
CREATE TRIGGER update_ai_stages_updated_at
  BEFORE UPDATE ON ai_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para reordenar estágios
CREATE TRIGGER reorder_stages_trigger
  BEFORE INSERT OR UPDATE OF stage_order ON ai_stages
  FOR EACH ROW
  EXECUTE FUNCTION reorder_ai_stages();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_stages_personality_id ON ai_stages(personality_id);
CREATE INDEX IF NOT EXISTS idx_ai_stages_order ON ai_stages(stage_order);
CREATE INDEX IF NOT EXISTS idx_ai_personality_active ON ai_personality_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_stages_active ON ai_stages(is_active);

-- Inserir dados de exemplo
INSERT INTO ai_personality_settings (name, description, personality_traits, response_style, tone, expertise_areas) VALUES
('Assistente Padrão', 'Personalidade padrão para atendimento geral', 
 '{"empathy": 8, "professionalism": 9, "friendliness": 7, "patience": 9}', 
'helpful', 'professional', 
'{"customer_service", "general_support"}'),

('Vendedor Especialista', 'Personalidade focada em vendas e conversão', 
 '{"persuasion": 9, "enthusiasm": 8, "confidence": 9, "empathy": 7}', 
'persuasive', 'enthusiastic', 
'{"sales", "product_knowledge", "negotiation"}'),

('Suporte Técnico', 'Personalidade para suporte técnico especializado', 
 '{"technical_expertise": 10, "patience": 10, "clarity": 9, "problem_solving": 10}', 
'technical', 'calm', 
'{"technical_support", "troubleshooting", "software"}');

-- Inserir estágios de exemplo
INSERT INTO ai_stages (name, description, stage_order, personality_id, prompts, conditions, actions) 
SELECT 
  'Saudação Inicial', 
  'Primeiro contato com o cliente', 
  1, 
  id, 
  '{"greeting": "Olá! Como posso ajudá-lo hoje?", "introduction": "Sou seu assistente virtual."}',
  '{"triggers": ["new_conversation", "first_message"]}',
  '{"collect_info": true, "set_context": true}'
FROM ai_personality_settings WHERE name = 'Assistente Padrão';

INSERT INTO ai_stages (name, description, stage_order, personality_id, prompts, conditions, actions) 
SELECT 
  'Qualificação', 
  'Entender as necessidades do cliente', 
  2, 
  id, 
  '{"questions": ["Qual é sua principal necessidade?", "Como posso melhor atendê-lo?"]}',
  '{"triggers": ["after_greeting", "need_qualification"]}',
  '{"qualify_lead": true, "gather_requirements": true}'
FROM ai_personality_settings WHERE name = 'Assistente Padrão';
`;

async function createAITables() {
  try {
    console.log('🔧 Criando tabelas AI no Supabase...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createAITablesSQL
    });
    
    if (error) {
      console.error('❌ Erro ao criar tabelas AI:', error.message);
      
      // Tentar executar SQL diretamente se a função RPC não existir
      console.log('🔄 Tentando executar SQL diretamente...');
      
      // Dividir o SQL em comandos menores
      const sqlCommands = createAITablesSQL.split(';').filter(cmd => cmd.trim());
      
      for (const command of sqlCommands) {
        if (command.trim()) {
          const { error: cmdError } = await supabase.from('_').select('*').limit(0);
          if (cmdError) {
            console.log('⚠️ Não é possível executar SQL diretamente via cliente Supabase');
            console.log('📝 SQL para executar manualmente no Supabase:');
            console.log('\n' + createAITablesSQL);
            return;
          }
        }
      }
    } else {
      console.log('✅ Tabelas AI criadas com sucesso!');
      console.log('📊 Dados de exemplo inseridos');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.log('📝 SQL para executar manualmente no Supabase:');
    console.log('\n' + createAITablesSQL);
  }
}

// Executar a criação das tabelas
createAITables();