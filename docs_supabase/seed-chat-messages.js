// Script específico para popular mensagens de chat realistas
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Mensagens realistas para conversas
const userMessages = [
  'Olá, gostaria de saber mais sobre os serviços',
  'Qual o valor da consultoria?',
  'Vocês atendem empresas do meu segmento?',
  'Preciso de uma solução para marketing digital',
  'Como funciona o processo de implementação?',
  'Quanto tempo demora para ver resultados?',
  'Vocês oferecem suporte pós-venda?',
  'Gostaria de agendar uma reunião',
  'Qual a experiência de vocês no mercado?',
  'Vocês trabalham com automação de vendas?',
  'Preciso melhorar minha presença online',
  'Como posso aumentar minhas vendas?',
  'Vocês fazem análise da minha empresa?',
  'Qual o ROI esperado dos serviços?',
  'Quando podemos começar?'
];

const assistantMessages = [
  'Olá! Fico feliz em ajudá-lo. Somos especializados em soluções digitais.',
  'Nossos valores variam conforme o projeto. Vou te enviar uma proposta personalizada.',
  'Sim, atendemos diversos segmentos. Qual é o seu ramo de atividade?',
  'Temos soluções completas de marketing digital. Pode me falar mais sobre suas necessidades?',
  'O processo é bem estruturado. Primeiro fazemos um diagnóstico da sua empresa.',
  'Geralmente os primeiros resultados aparecem em 30-60 dias.',
  'Claro! Oferecemos suporte completo durante todo o projeto.',
  'Perfeito! Qual horário seria melhor para você?',
  'Temos mais de 5 anos de experiência e já atendemos mais de 200 empresas.',
  'Sim, trabalhamos com automação completa do funil de vendas.',
  'Posso te ajudar com uma estratégia digital personalizada.',
  'Vamos analisar seu cenário atual e criar um plano de crescimento.',
  'Fazemos uma análise completa e gratuita. Posso agendar para esta semana?',
  'O ROI médio dos nossos clientes é de 300% em 12 meses.',
  'Podemos iniciar na próxima semana. Vou preparar os documentos.'
];

const followUpMessages = [
  'Conseguiu analisar a proposta que enviei?',
  'Tem alguma dúvida sobre o que conversamos?',
  'Gostaria de agendar nossa próxima conversa?',
  'Como está o andamento da aprovação interna?',
  'Precisa de mais informações sobre algum ponto?',
  'Quando seria um bom momento para retomar nossa conversa?',
  'Fico à disposição para esclarecer qualquer dúvida.',
  'Já conseguiu definir o orçamento para o projeto?',
  'Posso enviar algumas referências de cases similares?',
  'Que tal marcarmos uma demo da solução?'
];

// Popular n8n_chat_histories com conversas realistas
async function seedChatMessages() {
  console.log('💬 Populando mensagens de chat...');
  
  // Primeiro, buscar contatos existentes
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id, name, session_id, created_at')
    .limit(100);
  
  if (contactsError) {
    console.error('Erro ao buscar contatos:', contactsError.message);
    return;
  }
  
  const messages = [];
  
  for (const contact of contacts) {
    const sessionId = contact.session_id || `session_${contact.id.substring(0, 8)}`;
    const contactCreatedAt = new Date(contact.created_at);
    const numConversations = Math.floor(Math.random() * 5) + 2; // 2-6 conversas por contato
    
    let lastMessageTime = contactCreatedAt;
    
    for (let conv = 0; conv < numConversations; conv++) {
      // Espaçar conversas ao longo do tempo
      const daysBetween = Math.floor(Math.random() * 7) + 1;
      const conversationStart = new Date(lastMessageTime.getTime() + daysBetween * 24 * 60 * 60 * 1000);
      
      if (conversationStart > new Date()) break; // Não criar conversas no futuro
      
      const messagesInConversation = Math.floor(Math.random() * 8) + 3; // 3-10 mensagens por conversa
      let messageTime = conversationStart;
      
      for (let msg = 0; msg < messagesInConversation; msg++) {
        const isFromUser = msg % 2 === 0; // Alternar entre usuário e assistente
        
        let messageText;
        if (isFromUser) {
          if (msg === 0) {
            messageText = randomChoice(userMessages.slice(0, 5)); // Mensagens de abertura
          } else {
            messageText = randomChoice(userMessages);
          }
        } else {
          if (msg === 1) {
            messageText = randomChoice(assistantMessages.slice(0, 3)); // Respostas de saudação
          } else if (msg === messagesInConversation - 1 && Math.random() > 0.5) {
            messageText = randomChoice(followUpMessages); // Mensagens de follow-up
          } else {
            messageText = randomChoice(assistantMessages);
          }
        }
        
        const messageData = {
          message: messageText,
          timestamp: messageTime.toISOString(),
          sender: isFromUser ? 'user' : 'assistant',
          session_id: sessionId,
          user_name: contact.name
        };
        
        messages.push({
          id: Math.floor(Math.random() * 1000000) + Date.now() + msg,
          session_id: sessionId,
          message: messageData,
          data: messageTime.toISOString().split('T')[0],
          hora: messageTime.toTimeString().split(' ')[0],
          created_at: messageTime.toISOString()
        });
        
        // Adicionar delay realista entre mensagens (1-30 minutos)
        const delayMinutes = Math.floor(Math.random() * 30) + 1;
        messageTime = new Date(messageTime.getTime() + delayMinutes * 60 * 1000);
      }
      
      lastMessageTime = messageTime;
    }
  }
  
  // Ordenar mensagens por tempo
  messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
  // Inserir em lotes
  const batchSize = 100;
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    
    const { error } = await supabase.from('n8n_chat_histories').insert(batch);
    
    if (error) {
      console.error(`Erro ao inserir lote de mensagens ${i}-${i + batch.length}:`, error.message);
    } else {
      console.log(`✅ Inseridas mensagens ${i + 1}-${i + batch.length}`);
    }
  }
  
  console.log(`🎉 Total de ${messages.length} mensagens criadas para ${contacts.length} contatos`);
  return messages;
}

// Popular tabela conversations
async function seedConversations() {
  console.log('🗣️ Populando tabela conversations...');
  
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('*')
    .limit(100);
    
  if (contactsError) {
    console.error('Erro ao buscar contatos:', contactsError.message);
    return;
  }
  
  const conversations = contacts.map(contact => ({
    id: uuidv4(),
    session_id: contact.session_id || `session_${contact.id.substring(0, 8)}`,
    name: contact.name,
    client_name: contact.client_name,
    email: contact.email,
    phone: contact.phone,
    address: contact.address,
    client_type: contact.client_type,
    client_size: contact.client_size,
    last_message: randomChoice([
      'Vou analisar a proposta e retorno em breve',
      'Obrigado pelas informações',
      'Quando podemos agendar uma reunião?',
      'Gostei da apresentação dos serviços',
      'Preciso discutir internamente'
    ]),
    unread: Math.floor(Math.random() * 5),
    time: randomDate(new Date(contact.created_at), new Date()).toISOString(),
    created_at: contact.created_at,
    updated_at: new Date().toISOString()
  }));
  
  const { error } = await supabase.from('conversations').insert(conversations);
  
  if (error) {
    console.error('Erro ao inserir conversations:', error.message);
  } else {
    console.log(`✅ Inseridas ${conversations.length} conversações`);
  }
  
  return conversations;
}

// Função principal para popular dados de chat
async function seedAllChatData() {
  console.log('🚀 Iniciando seeding de dados de chat...');
  console.log('=' .repeat(50));
  
  try {
    const messages = await seedChatMessages();
    const conversations = await seedConversations();
    
    console.log('=' .repeat(50));
    console.log('🎉 Seeding de chat concluído com sucesso!');
    console.log(`💬 Mensagens: ${messages.length}`);
    console.log(`🗣️ Conversações: ${conversations.length}`);
    
  } catch (error) {
    console.error('❌ Erro durante seeding de chat:', error);
  }
}

// Executar se chamado diretamente
if (typeof require !== 'undefined' && require.main === module) {
  seedAllChatData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

export { seedAllChatData, seedChatMessages, seedConversations };