const fs = require('fs');
const path = require('path');

// Definições das tabelas AI faltantes
const aiTables = {
  ai_personality_settings: {
    Row: {
      id: 'string',
      name: 'string',
      description: 'string | null',
      personality_traits: 'Json | null',
      response_style: 'string | null',
      tone: 'string | null',
      expertise_areas: 'string[] | null',
      is_active: 'boolean | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Insert: {
      id: 'string',
      name: 'string',
      description: 'string | null',
      personality_traits: 'Json | null',
      response_style: 'string | null',
      tone: 'string | null',
      expertise_areas: 'string[] | null',
      is_active: 'boolean | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Update: {
      id: 'string',
      name: 'string',
      description: 'string | null',
      personality_traits: 'Json | null',
      response_style: 'string | null',
      tone: 'string | null',
      expertise_areas: 'string[] | null',
      is_active: 'boolean | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Relationships: []
  },
  ai_stages: {
    Row: {
      id: 'string',
      name: 'string',
      description: 'string | null',
      stage_order: 'number',
      personality_id: 'string | null',
      prompts: 'Json | null',
      conditions: 'Json | null',
      actions: 'Json | null',
      is_active: 'boolean | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Insert: {
      id: 'string',
      name: 'string',
      description: 'string | null',
      stage_order: 'number',
      personality_id: 'string | null',
      prompts: 'Json | null',
      conditions: 'Json | null',
      actions: 'Json | null',
      is_active: 'boolean | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Update: {
      id: 'string',
      name: 'string',
      description: 'string | null',
      stage_order: 'number',
      personality_id: 'string | null',
      prompts: 'Json | null',
      conditions: 'Json | null',
      actions: 'Json | null',
      is_active: 'boolean | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Relationships: [
      {
        foreignKeyName: 'ai_stages_personality_id_fkey',
        columns: ['personality_id'],
        isOneToOne: false,
        referencedRelation: 'ai_personality_settings',
        referencedColumns: ['id']
      }
    ]
  }
};

function generateTableDefinition(tableName, tableSchema) {
  const { Row, Insert, Update, Relationships } = tableSchema;
  
  let definition = `      ${tableName}: {\n`;
  
  // Row definition
  definition += `        Row: {\n`;
  for (const [key, type] of Object.entries(Row)) {
    definition += `          ${key}: ${type};\n`;
  }
  definition += `        };\n`;
  
  // Insert definition
  definition += `        Insert: {\n`;
  for (const [key, type] of Object.entries(Insert)) {
    const optional = type.includes('null') ? '?' : '';
    definition += `          ${key}${optional}: ${type};\n`;
  }
  definition += `        };\n`;
  
  // Update definition
  definition += `        Update: {\n`;
  for (const [key, type] of Object.entries(Update)) {
    definition += `          ${key}?: ${type};\n`;
  }
  definition += `        };\n`;
  
  // Relationships
  definition += `        Relationships: `;
  if (Relationships.length === 0) {
    definition += `[];\n`;
  } else {
    definition += `[\n`;
    for (const rel of Relationships) {
      definition += `          {\n`;
      definition += `            foreignKeyName: "${rel.foreignKeyName}";\n`;
      definition += `            columns: ["${rel.columns.join('", "')}"];\n`;
      definition += `            isOneToOne: ${rel.isOneToOne};\n`;
      definition += `            referencedRelation: "${rel.referencedRelation}";\n`;
      definition += `            referencedColumns: ["${rel.referencedColumns.join('", "')}"];\n`;
      definition += `          },\n`;
    }
    definition += `        ];\n`;
  }
  
  definition += `      };\n`;
  
  return definition;
}

function addAITablesToTypes() {
  const typesPath = path.join(__dirname, 'src', 'integrations', 'supabase', 'types.ts');
  
  try {
    let content = fs.readFileSync(typesPath, 'utf8');
    
    // Verificar se as tabelas já existem
    if (content.includes('ai_personality_settings:') && content.includes('ai_stages:')) {
      console.log('✅ Tabelas AI já existem no types.ts');
      return;
    }
    
    // Encontrar onde inserir as novas tabelas (antes do fechamento de Tables)
    const tablesEndPattern = /\s+};\s+Views:/;
    const match = content.match(tablesEndPattern);
    
    if (!match) {
      console.error('❌ Não foi possível encontrar o padrão para inserir as tabelas');
      return;
    }
    
    // Gerar definições das tabelas AI
    let newTablesDefinitions = '';
    for (const [tableName, tableSchema] of Object.entries(aiTables)) {
      newTablesDefinitions += generateTableDefinition(tableName, tableSchema);
    }
    
    // Inserir as novas definições antes do fechamento de Tables
    const insertPosition = match.index;
    const beforeTables = content.substring(0, insertPosition);
    const afterTables = content.substring(insertPosition);
    
    const updatedContent = beforeTables + newTablesDefinitions + afterTables;
    
    // Fazer backup do arquivo original
    fs.writeFileSync(typesPath + '.ai-backup', content);
    
    // Escrever o arquivo atualizado
    fs.writeFileSync(typesPath, updatedContent);
    
    console.log('✅ Tabelas AI adicionadas ao types.ts com sucesso!');
    console.log('📁 Backup criado em types.ts.ai-backup');
    console.log('🔧 Tabelas adicionadas:', Object.keys(aiTables).join(', '));
    
  } catch (error) {
    console.error('❌ Erro ao adicionar tabelas AI ao types.ts:', error.message);
  }
}

// Executar a adição das tabelas AI
addAITablesToTypes();