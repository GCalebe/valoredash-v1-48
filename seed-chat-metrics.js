// Script para criar dados de métricas de chat e conversas
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

// Criar dados para client_stats
async function seedClientStats() {
  console.log('Criando estatísticas de clientes...');
  
  const stats = [];
  const today = new Date();
  
  // Criar estatísticas para os últimos 30 dias
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    stats.push({
      id: uuidv4(),
      date: date.toISOString().split('T')[0],
      total_clients: randomInt(50, 200),
      new_clients: randomInt(1, 15),
      active_clients: randomInt(30, 150),
      conversion_rate: (Math.random() * 0.3 + 0.1).toFixed(3), // 10% a 40%
      total_revenue: randomInt(5000, 50000),
      avg_ticket: randomInt(500, 2000),
      created_at: date.toISOString(),
      updated_at: date.toISOString()
    });
  }
  
  const { data, error } = await supabase.from('client_stats').insert(stats);
  
  if (error) {
    console.error('Erro ao inserir client_stats:', error.message);
  } else {
    console.log(`Inseridas ${stats.length} estatísticas de clientes`);
  }
  
  return stats;
}

// Criar dados para conversation_metrics
async function seedConversationMetrics() {
  console.log('Criando métricas de conversas...');
  
  const metrics = [];
  const today = new Date();
  
  // Criar métricas para os últimos 30 dias
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const totalMessages = randomInt(100, 500);
    const totalConversations = randomInt(20, 80);
    
    metrics.push({
      id: uuidv4(),
      date: date.toISOString().split('T')[0],
      total_conversations: totalConversations,
      total_messages: totalMessages,
      avg_response_time: randomInt(30, 300), // segundos
      satisfaction_score: (Math.random() * 2 + 3).toFixed(1), // 3.0 a 5.0
      resolution_rate: (Math.random() * 0.3 + 0.6).toFixed(3), // 60% a 90%
      avg_conversation_duration: randomInt(300, 1800), // 5 a 30 minutos
      messages_per_conversation: (totalMessages / totalConversations).toFixed(1),
      created_at: date.toISOString(),
      updated_at: date.toISOString()
    });
  }
  
  const { data, error } = await supabase.from('conversation_metrics').insert(metrics);
  
  if (error) {
    console.error('Erro ao inserir conversation_metrics:', error.message);
  } else {
    console.log(`Inseridas ${metrics.length} métricas de conversas`);
  }
  
  return metrics;
}

// Criar dados para chat_messages
async function seedChatMessages() {
  console.log('Criando mensagens de chat...');
  
  // Primeiro, obter contatos existentes
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id, name, session_id')
    .limit(20);
  
  if (contactsError) {
    console.error('Erro ao buscar contatos:', contactsError.message);
    return [];
  }
  
  const messages = [];
  const messageTypes = ['text', 'image', 'audio', 'document'];
  const senders = ['user', 'assistant'];
  const sampleMessages = [
    'Olá! Como posso ajudá-lo hoje?',
    'Gostaria de saber mais sobre os serviços.',
    'Qual o valor da consultoria?',
    'Quando podemos agendar uma reunião?',
    'Obrigado pelo atendimento!',
    'Vou analisar a proposta e retorno em breve.',
    'Podemos fechar o contrato hoje?',
    'Preciso de mais informações sobre o projeto.',
    'Quando começa a implementação?',
    'Estou satisfeito com o resultado!'
  ];
  
  // Criar mensagens para cada contato
  for (const contact of contacts) {
    const numMessages = randomInt(5, 20);
    
    for (let i = 0; i < numMessages; i++) {
      const isFromUser = Math.random() > 0.4; // 60% das mensagens são do usuário
      
      messages.push({
        id: uuidv4(),
        session_id: contact.session_id || `session_${contact.id.substring(0, 8)}`,
        contact_id: contact.id,
        message: randomChoice(sampleMessages),
        sender: isFromUser ? 'user' : 'assistant',
        message_type: randomChoice(messageTypes),
        timestamp: randomDate(),
        is_read: Math.random() > 0.2, // 80% das mensagens são lidas
        metadata: {
          user_name: contact.name,
          response_time: isFromUser ? null : randomInt(5, 60)
        },
        created_at: randomDate(),
        updated_at: randomDate()
      });
    }
  }
  
  // Inserir em lotes
  const batchSize = 50;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const { data, error } = await supabase.from('chat_messages').insert(batch);
    
    if (error) {
      console.error(`Erro ao inserir lote de mensagens ${i}-${i + batch.length}:`, error.message);
    } else {
      console.log(`Inseridas mensagens ${i + 1}-${i + batch.length}`);
    }
  }
  
  return messages;
}

// Criar dados para funnel_data
async function seedFunnelData() {
  console.log('Criando dados de funil...');
  
  const funnelData = [];
  const stages = ['Lead', 'Qualificado', 'Reunião', 'Proposta', 'Negociação', 'Fechado'];
  const sources = ['Google Ads', 'Facebook', 'Instagram', 'LinkedIn', 'Indicação', 'Site'];
  
  // Criar dados de funil para os últimos 30 dias
  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    
    for (const stage of stages) {
      for (const source of sources) {
        const count = randomInt(1, 20);
        const value = count * randomInt(1000, 5000);
        
        funnelData.push({
          id: uuidv4(),
          date: date.toISOString().split('T')[0],
          stage: stage,
          source: source,
          count: count,
          value: value,
          conversion_rate: (Math.random() * 0.4 + 0.1).toFixed(3),
          created_at: date.toISOString(),
          updated_at: date.toISOString()
        });
      }
    }
  }
  
  // Inserir em lotes
  const batchSize = 100;
  for (let i = 0; i < funnelData.length; i += batchSize) {
    const batch = funnelData.slice(i, i + batchSize);
    const { data, error } = await supabase.from('funnel_data').insert(batch);
    
    if (error) {
      console.error(`Erro ao inserir lote de funnel_data ${i}-${i + batch.length}:`, error.message);
    } else {
      console.log(`Inseridos dados de funil ${i + 1}-${i + batch.length}`);
    }
  }
  
  return funnelData;
}

// Função principal
async function seedChatMetrics() {
  console.log('=== CRIANDO DADOS DE MÉTRICAS DE CHAT ===');
  
  try {
    const clientStats = await seedClientStats();
    const conversationMetrics = await seedConversationMetrics();
    const chatMessages = await seedChatMessages();
    const funnelData = await seedFunnelData();
    
    console.log('\n=== RESUMO ===');
    console.log(`Estatísticas de clientes: ${clientStats.length}`);
    console.log(`Métricas de conversas: ${conversationMetrics.length}`);
    console.log(`Mensagens de chat: ${chatMessages.length}`);
    console.log(`Dados de funil: ${funnelData.length}`);
    console.log('\nDados de métricas de chat criados com sucesso!');
    
  } catch (error) {
    console.error('Erro ao criar dados de métricas:', error);
  }
}

// Executar
seedChatMetrics().catch(console.error);