const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createObjectionsTable() {
  try {
    console.log('Criando tabela product_objections...');
    
    // Ler o arquivo SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create-objections-table.sql'), 'utf8');
    
    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      console.error('Erro ao criar tabela:', error);
      return;
    }
    
    console.log('Tabela product_objections criada com sucesso!');
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

// Função alternativa usando queries individuais
async function createObjectionsTableAlternative() {
  try {
    console.log('Criando tabela product_objections (método alternativo)...');
    
    // Criar a tabela
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS product_objections (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id UUID NOT NULL REFERENCES ai_products(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID REFERENCES auth.users(id)
      );
    `;
    
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: createTableQuery
    });
    
    if (tableError) {
      console.error('Erro ao criar tabela:', tableError);
      return;
    }
    
    console.log('Tabela criada com sucesso!');
    
    // Criar índices
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_product_objections_product_id ON product_objections(product_id);',
      'CREATE INDEX IF NOT EXISTS idx_product_objections_created_at ON product_objections(created_at);'
    ];
    
    for (const query of indexQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.error('Erro ao criar índice:', error);
      }
    }
    
    console.log('Índices criados com sucesso!');
    
    // Habilitar RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE product_objections ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.error('Erro ao habilitar RLS:', rlsError);
    } else {
      console.log('RLS habilitado com sucesso!');
    }
    
    console.log('Configuração da tabela product_objections concluída!');
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

// Executar a função
createObjectionsTableAlternative();