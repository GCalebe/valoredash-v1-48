const fs = require('fs');
const path = require('path');

// Definições das tabelas faltantes baseadas na inspeção do banco de dados
const missingTables = {
  ai_products: {
    Row: {
      id: 'string',
      name: 'string | null',
      description: 'string | null',
      price: 'number | null',
      category: 'string | null',
      features: 'Json | null',
      is_active: 'boolean | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Insert: {
      id: 'string',
      name: 'string | null',
      description: 'string | null',
      price: 'number | null',
      category: 'string | null',
      features: 'Json | null',
      is_active: 'boolean | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Update: {
      id: 'string',
      name: 'string | null',
      description: 'string | null',
      price: 'number | null',
      category: 'string | null',
      features: 'Json | null',
      is_active: 'boolean | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Relationships: []
  },
  client_stats: {
    Row: {
      id: 'string',
      client_id: 'string | null',
      total_conversations: 'number | null',
      total_messages: 'number | null',
      avg_response_time: 'number | null',
      last_interaction: 'string | null',
      satisfaction_score: 'number | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Insert: {
      id: 'string',
      client_id: 'string | null',
      total_conversations: 'number | null',
      total_messages: 'number | null',
      avg_response_time: 'number | null',
      last_interaction: 'string | null',
      satisfaction_score: 'number | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Update: {
      id: 'string',
      client_id: 'string | null',
      total_conversations: 'number | null',
      total_messages: 'number | null',
      avg_response_time: 'number | null',
      last_interaction: 'string | null',
      satisfaction_score: 'number | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Relationships: [
      {
        foreignKeyName: 'client_stats_client_id_fkey',
        columns: ['client_id'],
        isOneToOne: false,
        referencedRelation: 'contacts',
        referencedColumns: ['id']
      }
    ]
  },
  conversation_metrics: {
    Row: {
      id: 'string',
      conversation_id: 'string | null',
      message_count: 'number | null',
      duration_minutes: 'number | null',
      sentiment_score: 'number | null',
      resolution_status: 'string | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Insert: {
      id: 'string',
      conversation_id: 'string | null',
      message_count: 'number | null',
      duration_minutes: 'number | null',
      sentiment_score: 'number | null',
      resolution_status: 'string | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Update: {
      id: 'string',
      conversation_id: 'string | null',
      message_count: 'number | null',
      duration_minutes: 'number | null',
      sentiment_score: 'number | null',
      resolution_status: 'string | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Relationships: [
      {
        foreignKeyName: 'conversation_metrics_conversation_id_fkey',
        columns: ['conversation_id'],
        isOneToOne: false,
        referencedRelation: 'conversations',
        referencedColumns: ['id']
      }
    ]
  },
  funnel_data: {
    Row: {
      id: 'string',
      stage_name: 'string | null',
      client_count: 'number | null',
      conversion_rate: 'number | null',
      avg_time_in_stage: 'number | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Insert: {
      id: 'string',
      stage_name: 'string | null',
      client_count: 'number | null',
      conversion_rate: 'number | null',
      avg_time_in_stage: 'number | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Update: {
      id: 'string',
      stage_name: 'string | null',
      client_count: 'number | null',
      conversion_rate: 'number | null',
      avg_time_in_stage: 'number | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Relationships: []
  },
  utm_metrics: {
    Row: {
      id: 'string',
      utm_source: 'string | null',
      utm_medium: 'string | null',
      utm_campaign: 'string | null',
      total_visits: 'number | null',
      total_conversions: 'number | null',
      conversion_rate: 'number | null',
      total_revenue: 'number | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Insert: {
      id: 'string',
      utm_source: 'string | null',
      utm_medium: 'string | null',
      utm_campaign: 'string | null',
      total_visits: 'number | null',
      total_conversions: 'number | null',
      conversion_rate: 'number | null',
      total_revenue: 'number | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Update: {
      id: 'string',
      utm_source: 'string | null',
      utm_medium: 'string | null',
      utm_campaign: 'string | null',
      total_visits: 'number | null',
      total_conversions: 'number | null',
      conversion_rate: 'number | null',
      total_revenue: 'number | null',
      created_at: 'string | null',
      updated_at: 'string | null'
    },
    Relationships: []
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

function updateTypesFile() {
  const typesPath = path.join(__dirname, 'src', 'integrations', 'supabase', 'types.ts');
  
  try {
    let content = fs.readFileSync(typesPath, 'utf8');
    
    // Encontrar onde inserir as novas tabelas (antes do fechamento de Tables)
    const tablesEndPattern = /\s+};\s+Views:/;
    const match = content.match(tablesEndPattern);
    
    if (!match) {
      console.error('Não foi possível encontrar o padrão para inserir as tabelas');
      return;
    }
    
    // Gerar definições das tabelas faltantes
    let newTablesDefinitions = '';
    for (const [tableName, tableSchema] of Object.entries(missingTables)) {
      newTablesDefinitions += generateTableDefinition(tableName, tableSchema);
    }
    
    // Inserir as novas definições antes do fechamento de Tables
    const insertPosition = match.index;
    const beforeTables = content.substring(0, insertPosition);
    const afterTables = content.substring(insertPosition);
    
    const updatedContent = beforeTables + newTablesDefinitions + afterTables;
    
    // Fazer backup do arquivo original
    fs.writeFileSync(typesPath + '.backup', content);
    
    // Escrever o arquivo atualizado
    fs.writeFileSync(typesPath, updatedContent);
    
    console.log('✅ Arquivo types.ts atualizado com sucesso!');
    console.log('📁 Backup criado em types.ts.backup');
    console.log('🔧 Tabelas adicionadas:', Object.keys(missingTables).join(', '));
    
  } catch (error) {
    console.error('❌ Erro ao atualizar types.ts:', error.message);
  }
}

// Executar a atualização
updateTypesFile();