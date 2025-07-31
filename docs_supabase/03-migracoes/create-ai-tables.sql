-- =====================================================
-- CRIAÇÃO DAS TABELAS DE IA FALTANTES
-- Script para criar as tabelas ai_personality_settings e ai_stages
-- =====================================================

-- Tabela para configurações de personalidade da IA
CREATE TABLE IF NOT EXISTS ai_personality_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Assistente Virtual',
    description TEXT,
    tone VARCHAR(255),
    personality TEXT,
    formality INTEGER DEFAULT 3 CHECK (formality >= 1 AND formality <= 5),
    empathy INTEGER DEFAULT 4 CHECK (empathy >= 1 AND empathy <= 5),
    creativity INTEGER DEFAULT 3 CHECK (creativity >= 1 AND creativity <= 5),
    directness INTEGER DEFAULT 3 CHECK (directness >= 1 AND directness <= 5),
    greeting TEXT,
    farewell TEXT,
    special_instructions TEXT,
    max_responses INTEGER DEFAULT 3,
    message_size INTEGER DEFAULT 3,
    response_time INTEGER DEFAULT 3,
    audio_response BOOLEAN DEFAULT FALSE,
    response_creativity INTEGER DEFAULT 3 CHECK (response_creativity >= 1 AND response_creativity <= 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para estágios da IA
CREATE TABLE IF NOT EXISTS ai_stages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    trigger VARCHAR(255),
    actions TEXT[] DEFAULT '{}',
    next_stage VARCHAR(255),
    "order" INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para reordenar estágios da IA
CREATE OR REPLACE FUNCTION reorder_ai_stages(stage_orders JSONB)
RETURNS VOID AS $$
DECLARE
    stage_record RECORD;
BEGIN
    -- Iterar sobre os estágios e atualizar suas ordens
    FOR stage_record IN SELECT * FROM jsonb_each(stage_orders)
    LOOP
        UPDATE ai_stages 
        SET "order" = (stage_record.value)::INTEGER,
            updated_at = NOW()
        WHERE id = (stage_record.key)::INTEGER;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_ai_personality_settings_updated_at
    BEFORE UPDATE ON ai_personality_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_stages_updated_at
    BEFORE UPDATE ON ai_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_personality_settings_is_active ON ai_personality_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_stages_order ON ai_stages("order");
CREATE INDEX IF NOT EXISTS idx_ai_stages_is_active ON ai_stages(is_active);

-- Inserir dados de exemplo para ai_personality_settings
INSERT INTO ai_personality_settings (
    name, description, tone, personality, formality, empathy, creativity, directness,
    greeting, farewell, special_instructions, max_responses, message_size, response_time,
    audio_response, response_creativity, is_active
) VALUES (
    'Assistente Virtual',
    'Assistente especializado em atendimento ao cliente',
    'amigável e profissional',
    'Sou um assistente virtual dedicado a ajudar você da melhor forma possível. Tenho conhecimento sobre nossos serviços e estou sempre disposto a esclarecer suas dúvidas.',
    3, 4, 3, 3,
    'Olá! Como posso ajudá-lo hoje?',
    'Foi um prazer ajudá-lo! Tenha um ótimo dia!',
    'Sempre seja cordial e tente resolver o problema do cliente. Se não souber algo, admita e direcione para um humano.',
    3, 3, 3, FALSE, 3, TRUE
) ON CONFLICT DO NOTHING;

-- Inserir dados de exemplo para ai_stages
INSERT INTO ai_stages (name, description, trigger, actions, next_stage, "order", is_active) VALUES
('Saudação Inicial', 'Primeira interação com o cliente', 'início da conversa', ARRAY['Cumprimentar o cliente', 'Apresentar-se', 'Perguntar como pode ajudar'], 'Identificação da Necessidade', 1, TRUE),
('Identificação da Necessidade', 'Entender o que o cliente precisa', 'cliente fez uma pergunta', ARRAY['Fazer perguntas específicas', 'Escutar ativamente', 'Categorizar a necessidade'], 'Fornecimento de Informações', 2, TRUE),
('Fornecimento de Informações', 'Fornecer informações relevantes', 'necessidade identificada', ARRAY['Buscar informações no conhecimento', 'Explicar de forma clara', 'Verificar entendimento'], 'Resolução ou Encaminhamento', 3, TRUE),
('Resolução ou Encaminhamento', 'Resolver o problema ou encaminhar', 'informações fornecidas', ARRAY['Tentar resolver diretamente', 'Encaminhar para humano se necessário', 'Agendar follow-up'], 'Finalização', 4, TRUE),
('Finalização', 'Encerrar a conversa adequadamente', 'problema resolvido ou encaminhado', ARRAY['Resumir o que foi feito', 'Perguntar se há mais alguma dúvida', 'Despedir-se cordialmente'], '', 5, TRUE)
ON CONFLICT DO NOTHING;

COMMIT;