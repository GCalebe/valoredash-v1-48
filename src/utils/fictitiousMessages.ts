import { Contact } from "@/types/client";

const fictitiousMessages = [
  "Olá! Gostaria de saber mais sobre os serviços disponíveis.",
  "Quando posso agendar uma consulta?",
  "Obrigado pelo atendimento, foi muito esclarecedor!",
  "Preciso reagendar minha consulta para a próxima semana.",
  "Qual o valor do serviço que conversamos?",
  "Gostei muito da proposta, vamos fechar negócio!",
  "Poderia me enviar mais detalhes por WhatsApp?",
  "Estou interessado, mas preciso conversar com minha esposa primeiro.",
  "Perfeito! Quando podemos iniciar o processo?",
  "Vocês atendem na região da Barra da Tijuca?",
  "Gostaria de uma segunda opinião sobre o orçamento.",
  "Muito obrigado pela atenção, vou avaliar a proposta.",
  "Posso levar meu barco para avaliação amanhã?",
  "Qual o prazo de entrega para este serviço?",
  "Vocês trabalham com financiamento?",
  "Excelente atendimento! Recomendarei para meus amigos.",
  "Preciso de um orçamento urgente, é possível?",
  "Quando vocês têm disponibilidade para vistoria?",
  "O preço está dentro do que esperava, vamos prosseguir!",
  "Gostaria de agendar para o próximo mês.",
  "Podem me explicar melhor como funciona o processo?",
  "Estou com algumas dúvidas sobre a documentação necessária.",
  "Achei interessante a proposta, mas preciso pensar um pouco mais.",
  "Já tive experiências ruins com outras empresas, vocês são diferentes?",
  "Meu sócio também precisa aprovar, posso apresentar a proposta?",
  "Qual a diferença entre os pacotes oferecidos?",
  "Tem algum desconto para pagamento à vista?",
  "Posso marcar uma reunião para semana que vem?",
  "Vocês têm referências de outros clientes?",
  "O sistema é fácil de usar? Minha equipe não é muito técnica.",
  "Quanto tempo demora a implementação completa?",
  "Podem fazer uma demonstração do sistema?",
  "Estou comparando com outras opções, qual o diferencial de vocês?",
  "Minha empresa está em crescimento, o sistema acompanha?",
  "Vocês fazem treinamento da equipe?",
  "Há suporte técnico 24 horas?",
  "Posso testar o sistema antes de fechar?",
  "Qual o investimento total incluindo implementação?",
  "Vocês têm cases de sucesso no meu segmento?",
  "Estou muito satisfeito com o atendimento até agora!",
];

const timeVariations = [
  "2 min",
  "15 min",
  "1h",
  "3h",
  "Ontem",
  "2 dias",
  "1 semana",
  "2 semanas",
  "1 mês",
  "Hoje",
  "5 min",
  "30 min",
  "2h",
  "5h",
  "3 dias",
  "4 dias",
  "10 dias",
  "Agora",
];

// Mensagens específicas por tipo de cliente
const messagesByClientType = {
  "pessoa-juridica": [
    "Precisamos de uma solução para toda a empresa.",
    "Qual o ROI esperado com essa implementação?",
    "Nosso departamento jurídico precisa avaliar o contrato.",
    "Podemos agendar uma apresentação para a diretoria?",
    "Qual o prazo para implementar em todas as filiais?",
    "Vocês têm certificações de segurança da informação?",
    "Preciso de um orçamento detalhado para aprovação.",
    "Como funciona o processo de integração com nossos sistemas?",
    "Temos uma demanda muito específica, conseguem atender?",
    "Qual o nível de customização possível?",
  ],
  "pessoa-fisica": [
    "É muito complicado de usar?",
    "Posso cancelar se não me adaptar?",
    "Quanto custa por mês?",
    "Vocês fazem instalação em casa?",
    "Meu filho pode me ajudar a usar?",
    "Tem suporte por telefone?",
    "É seguro fazer pagamentos online?",
    "Posso pagar parcelado?",
    "Demora muito para aprender?",
    "Vocês têm outros clientes aqui na região?",
  ],
};

// Mensagens por estágio do kanban
const messagesByStage = {
  "Nova consulta": [
    "Olá! Gostaria de mais informações.",
    "Podem me explicar como funciona?",
    "Estou interessado em saber mais detalhes.",
    "Vi vocês na internet e fiquei curioso.",
  ],
  Qualificado: [
    "Parece ser exatamente o que eu precisava!",
    "Quando podemos conversar melhor?",
    "Estou bem interessado na proposta.",
    "Vocês atendem empresas do meu porte?",
  ],
  "Chamada agendada": [
    "Confirmando nossa reunião para amanhã.",
    "Preciso reagendar nossa conversa.",
    "Estou ansioso para a apresentação.",
    "Vou levar meu sócio na reunião também.",
  ],
  Reunião: [
    "A apresentação foi muito boa!",
    "Preciso de alguns esclarecimentos adicionais.",
    "Quando vocês enviam a proposta?",
    "Gostei muito do que vi hoje.",
  ],
  Negociação: [
    "Podemos negociar o valor?",
    "Tem desconto para pagamento à vista?",
    "Preciso conversar com meu contador.",
    "Vamos analisar a proposta internamente.",
  ],
  "Preparando proposta": [
    "Quando recebo a proposta oficial?",
    "Podem incluir aqueles itens que conversamos?",
    "Qual o prazo de validade da proposta?",
    "Estou aguardando o orçamento detalhado.",
  ],
  "Fatura enviada": [
    "Recebi a fatura, vou processar o pagamento.",
    "Há algum prazo para pagamento?",
    "Quando começamos após o pagamento?",
    "Posso pagar em duas parcelas?",
  ],
  Acompanhamento: [
    "Como está andando o projeto?",
    "Quando será a próxima etapa?",
    "Estou muito satisfeito até agora!",
    "Preciso de um status atualizado.",
  ],
  "Projeto cancelado – perdido": [
    "Infelizmente vamos cancelar o projeto.",
    "Decidimos por outra solução.",
    "O orçamento ficou acima do esperado.",
    "Talvez no futuro possamos retomar.",
  ],
};

export const generateFictitiousConversation = (contact: Contact): Contact => {
  let selectedMessages = fictitiousMessages;

  // Escolher mensagem baseada no tipo de cliente
  if (
    contact.clientType &&
    messagesByClientType[
      contact.clientType as keyof typeof messagesByClientType
    ]
  ) {
    const typeMessages =
      messagesByClientType[
        contact.clientType as keyof typeof messagesByClientType
      ];
    if (Math.random() > 0.5) {
      selectedMessages = [...typeMessages, ...fictitiousMessages];
    }
  }

  // Escolher mensagem baseada no estágio do kanban
  if (
    contact.kanbanStage &&
    messagesByStage[contact.kanbanStage as keyof typeof messagesByStage]
  ) {
    const stageMessages =
      messagesByStage[contact.kanbanStage as keyof typeof messagesByStage];
    if (Math.random() > 0.3) {
      selectedMessages = [...stageMessages, ...selectedMessages];
    }
  }

  const randomMessage =
    selectedMessages[Math.floor(Math.random() * selectedMessages.length)];
  const randomTime =
    timeVariations[Math.floor(Math.random() * timeVariations.length)];

  // Maior chance de mensagens não lidas para clientes ativos
  let unreadCount = 0;
  if (contact.status === "Active") {
    unreadCount = Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0;
  }

  // Clientes em negociação têm mais chance de ter mensagens não lidas
  if (
    contact.kanbanStage === "Negociação" ||
    contact.kanbanStage === "Preparando proposta"
  ) {
    unreadCount = Math.random() > 0.4 ? Math.floor(Math.random() * 5) + 1 : 0;
  }

  return {
    ...contact,
    lastMessage: randomMessage,
    lastMessageTime: randomTime,
    unreadCount: unreadCount,
  };
};

export const generateFictitiousConversations = (
  contacts: Contact[],
): Contact[] => {
  return contacts.map((contact) => generateFictitiousConversation(contact));
};
