// Script para preencher tabelas vazias no Supabase
// Cria dados consistentes para todas as tabelas identificadas como vazias

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nkyvhwmjuksumizljclc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reXZod21qdWtzdW1pemxqY2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1ODI4NzIsImV4cCI6MjA2NTE1ODg3Mn0.JYAUGHTbf9KVPCYFN9IDCm2uRT85cEj9G7llkOcrBEk';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para gerar UUID v4
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Função para gerar data aleatória nos últimos 6 meses
function randomDate(start = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), end = new Date()) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

// Função para gerar um número aleatório entre min e max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para escolher aleatoriamente um item de um array
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Dados para geração de contatos
const nomes = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Roberto', 'Fernanda', 'Lucas', 'Mariana'];
const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Ferreira', 'Costa', 'Rodrigues', 'Almeida', 'Pereira', 'Carvalho'];
const empresas = ['Tech Solutions', 'Consultoria Ágil', 'Inovação Digital', 'Marketing Estratégico', 'Comércio Express', 'Serviços Financeiros', 'Educação Avançada', 'Saúde Integral', 'Construção Moderna', 'Logística Eficiente'];
const tamanhos = ['Pequeno', 'Médio', 'Grande'];
const tipos = ['pessoa-fisica', 'pessoa-juridica'];
const setores = ['tecnologia', 'saude', 'educacao', 'financeiro', 'varejo', 'industria', 'servicos', 'construcao', 'alimentacao', 'transporte'];
const estagios = ['Nova consulta', 'Qualificado', 'Reunião agendada', 'Proposta enviada', 'Negociação', 'Fechado - ganho', 'Fechado - perdido'];
const mensagens = [
  'Olá! Gostaria de saber mais sobre os serviços.',
  'Quando podemos agendar uma reunião?',
  'Obrigado pelo atendimento, foi muito esclarecedor!',
  'Qual o valor do serviço que conversamos?',
  'Preciso reagendar minha consulta para a próxima semana.',
  'Estou analisando a proposta enviada.',
  'Podemos fechar o contrato hoje?',
  'Vou precisar de mais tempo para decidir.',
  'Já assinei o contrato e enviei por email.',
  'Quando começa a implementação do projeto?'
];
const tempos = ['Agora', '5 min', '30 min', '1h', '3h', 'Ontem', '2 dias', '1 semana'];
const responsaveis = ['Gabriel Calebe', 'Ana Costa', 'Lucas Mendes', 'Mariana Oliveira', 'Rafael Santos'];
const tags = ['VIP', 'Urgente', 'Automação', 'Consultoria', 'Digitalização', 'Pessoa Física', 'Tecnologia', 'Marketing', 'Financeiro', 'Educação'];
const objetivos = [
  'Automatizar processos internos da empresa',
  'Digitalizar documentos jurídicos',
  'Consultoria para abertura de negócio',
  'Sistema de gestão para restaurantes',
  'Desenvolvimento de plataforma customizada',
  'Implementação de CRM',
  'Estratégia de marketing digital',
  'Otimização de processos financeiros',
  'Treinamento de equipe',
  'Expansão de mercado'
];
const razoesPerdas = ['orcamento', 'concorrencia', 'timing', 'necessidade', 'decisor'];
const pagamentos = ['pago', 'pendente', 'atrasado', 'cancelado'];
const metodosPagamento = ['cartao', 'pix', 'boleto', 'transferencia', 'dinheiro'];

// Gerar dados para a tabela contacts
async function seedContacts(count = 20) {
  console.log(`Gerando ${count} contatos...`);
  
  const contacts = [];
  
  for (let i = 0; i < count; i++) {
    const isPessoaJuridica = Math.random() > 0.3;
    const nome = `${randomChoice(nomes)} ${randomChoice(sobrenomes)}`;
    const empresa = isPessoaJuridica ? randomChoice(empresas) : null;
    const estagio = randomChoice(estagios);
    const fechado = estagio.includes('Fechado');
    const ganho = estagio.includes('ganho');
    const id = uuidv4();
    const sessionId = `session_${id.substring(0, 8)}`;
    
    contacts.push({
      id,
      name: nome,
      email: `${nome.toLowerCase().replace(' ', '.')}@${Math.random() > 0.5 ? 'gmail.com' : 'empresa.com.br'}`,
      phone: `+55 ${randomInt(11, 99)} 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
      address: `${randomChoice(['Rua', 'Avenida', 'Alameda'])} ${randomChoice(['das Flores', 'Principal', 'Central', 'do Comércio', 'da Paz'])}, ${randomInt(1, 999)} - ${randomChoice(['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Salvador', 'Recife', 'Fortaleza'])}, ${randomChoice(['SP', 'RJ', 'MG', 'PR', 'RS', 'BA', 'PE', 'CE'])}`,
      client_name: empresa,
      client_size: randomChoice(tamanhos),
      client_type: isPessoaJuridica ? 'pessoa-juridica' : 'pessoa-fisica',
      cpf_cnpj: isPessoaJuridica ? `${randomInt(10, 99)}.${randomInt(100, 999)}.${randomInt(100, 999)}/0001-${randomInt(10, 99)}` : `${randomInt(100, 999)}.${randomInt(100, 999)}.${randomInt(100, 999)}-${randomInt(10, 99)}`,
      asaas_customer_id: `cus_${randomInt(100000, 999999)}`,
      status: Math.random() > 0.1 ? 'Active' : 'Inactive',
      notes: Math.random() > 0.3 ? `Cliente ${Math.random() > 0.5 ? 'muito interessado' : 'com potencial'} em ${randomChoice(['soluções de automação', 'consultoria especializada', 'serviços digitais', 'implementação de sistema'])}` : null,
      last_contact: randomDate(),
      kanban_stage: estagio,
      last_message: randomChoice(mensagens),
      last_message_time: randomChoice(tempos),
      unread_count: randomInt(0, 5),
      session_id: sessionId,
      tags: Array.from({length: randomInt(1, 4)}, () => randomChoice(tags)),
      responsible_user: randomChoice(responsaveis),
      sales: ganho ? randomInt(5000, 50000) : 0,
      client_sector: randomChoice(setores),
      budget: randomInt(5000, 100000),
      payment_method: ganho ? randomChoice(metodosPagamento) : null,
      client_objective: randomChoice(objetivos),
      loss_reason: !ganho && fechado ? randomChoice(razoesPerdas) : null,
      contract_number: ganho ? `CTR-${new Date().getFullYear()}-${randomInt(100, 999)}` : null,
      contract_date: ganho ? randomDate() : null,
      payment: ganho ? randomChoice(pagamentos) : null,
      uploaded_files: Math.random() > 0.5 ? Array.from({length: randomInt(0, 3)}, () => `${['contrato', 'proposta', 'briefing', 'ata', 'layout'][randomInt(0, 4)]}_${randomInt(1, 100)}.${['pdf', 'docx', 'png', 'jpg'][randomInt(0, 3)]}`) : [],
      consultation_stage: estagio,
      created_at: randomDate(),
      updated_at: randomDate()
    });
  }
  
  // Inserir contatos em lotes de 10
  const batchSize = 10;
  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize);
    const { data, error } = await supabase.from('contacts').insert(batch);
    
    if (error) {
      console.error(`Erro ao inserir lote de contatos ${i}-${i + batch.length}:`, error.message);
    } else {
      console.log(`Inseridos contatos ${i + 1}-${i + batch.length}`);
    }
  }
  
  return contacts;
}

// Gerar dados para a tabela utm_tracking
async function seedUtmTracking(contacts, count = 30) {
  console.log(`Gerando ${count} registros de UTM tracking...`);
  
  const utmSources = ['google', 'facebook', 'instagram', 'linkedin', 'email', 'direct'];
  const utmMediums = ['cpc', 'organic', 'social', 'email', 'referral', 'display'];
  const utmCampaigns = ['verao2024', 'inverno2024', 'black_friday', 'lancamento', 'remarketing'];
  const utmTerms = ['marketing', 'automacao', 'consultoria', 'gestao', 'tecnologia'];
  const utmContents = ['anuncio1', 'anuncio2', 'banner', 'post', 'story', 'email'];
  const landingPages = ['/', '/servicos', '/contato', '/sobre', '/precos', '/blog'];
  const deviceTypes = ['mobile', 'desktop', 'tablet'];
  const conversionStages = ['Lead', 'MQL', 'SQL', 'Oportunidade', 'Cliente'];
  
  const utmRecords = [];
  
  // Verificar se temos contatos válidos
  let validContactIds = [];
  
  if (contacts && contacts.length > 0) {
    // Verificar se os contatos têm IDs válidos
    validContactIds = contacts.filter(c => c && c.id).map(c => c.id);
  }
  
  // Se não tivermos contatos válidos, verificar diretamente no banco de dados
  if (validContactIds.length === 0) {
    const { data: dbContacts, error } = await supabase
      .from('contacts')
      .select('id')
      .limit(count);
    
    if (!error && dbContacts && dbContacts.length > 0) {
      validContactIds = dbContacts.map(c => c.id);
      console.log(`Obtidos ${validContactIds.length} IDs de contatos do banco de dados`);
    } else {
      console.log('Não foi possível obter IDs de contatos válidos, gerando novos UUIDs');
    }
  }
  
  for (let i = 0; i < count; i++) {
    // Usar ID de contato válido ou gerar um novo UUID
    const leadId = validContactIds.length > 0 ? 
      validContactIds[i % validContactIds.length] : 
      uuidv4();
    const conversion = Math.random() > 0.6;
    
    utmRecords.push({
      id: uuidv4(),
      lead_id: leadId,
      utm_source: randomChoice(utmSources),
      utm_medium: randomChoice(utmMediums),
      utm_campaign: randomChoice(utmCampaigns),
      utm_term: randomChoice(utmTerms),
      utm_content: randomChoice(utmContents),
      utm_conversion: conversion,
      utm_conversion_value: conversion ? randomInt(1000, 10000) : null,
      utm_conversion_stage: conversion ? randomChoice(conversionStages) : null,
      landing_page: randomChoice(landingPages),
      device_type: randomChoice(deviceTypes),
      created_at: randomDate()
    });
  }
  
  // Inserir em lotes para evitar erros
  const batchSize = 10;
  for (let i = 0; i < utmRecords.length; i += batchSize) {
    const batch = utmRecords.slice(i, i + batchSize);
    const { data, error } = await supabase.from('utm_tracking').insert(batch);
    
    if (error) {
      console.error(`Erro ao inserir lote de UTM tracking ${i}-${i + batch.length}:`, error.message);
    } else {
      console.log(`Inseridos registros UTM ${i + 1}-${i + batch.length}`);
    }
  }
  
  return utmRecords;
}

// Gerar dados para a tabela custom_field_validation_rules
async function seedCustomFieldValidationRules(customFields) {
  console.log('Gerando regras de validação para campos personalizados...');
  
  // Verificar quais tipos de regras são permitidos na tabela
  let allowedRuleTypes = ['required', 'min_length', 'max_length', 'regex', 'email', 'number_range'];
  
  try {
    // Tentar obter os valores do enum diretamente
    const { data: enumValues, error: enumError } = await supabase
      .rpc('get_enum_values', { enum_name: 'rule_type_enum' })
      .select();
    
    if (!enumError && enumValues && enumValues.length > 0) {
      // Se conseguimos obter os valores do enum, usamos eles
      allowedRuleTypes = enumValues;
      console.log('Tipos de regras permitidos:', allowedRuleTypes);
    } else {
      // Se não conseguimos obter os valores do enum, usamos valores padrão
      console.log('Não foi possível obter os tipos de regras permitidos via RPC');
    }
  } catch (error) {
    console.error('Erro ao verificar tipos de regras permitidos:', error);
  }
  
  const rules = [];
  
  // Para cada campo personalizado, criar 1-3 regras de validação
  for (const field of customFields) {
    const numRules = randomInt(1, 3);
    
    for (let i = 0; i < numRules; i++) {
      const ruleType = randomChoice(allowedRuleTypes);
      let ruleValue = null;
      let errorMessage = '';
      
      switch (ruleType) {
        case 'required':
          errorMessage = `O campo ${field.field_name} é obrigatório`;
          break;
        case 'min_length':
          ruleValue = randomInt(3, 10).toString();
          errorMessage = `O campo ${field.field_name} deve ter pelo menos ${ruleValue} caracteres`;
          break;
        case 'max_length':
          ruleValue = randomInt(20, 100).toString();
          errorMessage = `O campo ${field.field_name} deve ter no máximo ${ruleValue} caracteres`;
          break;
        case 'regex':
          ruleValue = field.field_type === 'email' ? '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' : '^[A-Za-z0-9 ]+$';
          errorMessage = `O campo ${field.field_name} contém caracteres inválidos`;
          break;
        case 'email':
          errorMessage = `O campo ${field.field_name} deve ser um email válido`;
          break;
        case 'number_range':
          const min = randomInt(1, 50);
          const max = randomInt(51, 100);
          ruleValue = `${min}-${max}`;
          errorMessage = `O campo ${field.field_name} deve estar entre ${min} e ${max}`;
          break;
      }
      
      rules.push({
        id: uuidv4(),
        field_id: field.id,
        rule_type: ruleType,
        rule_value: ruleValue,
        error_message: errorMessage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }
  
  if (rules.length > 0) {
    // Inserir em lotes para evitar erros
    const batchSize = 5;
    for (let i = 0; i < rules.length; i += batchSize) {
      const batch = rules.slice(i, i + batchSize);
      const { data, error } = await supabase.from('custom_field_validation_rules').insert(batch);
      
      if (error) {
        console.error(`Erro ao inserir lote de regras ${i}-${i + batch.length}:`, error.message);
      } else {
        console.log(`Inseridas regras ${i + 1}-${i + batch.length}`);
      }
    }
  }
  
  return rules;
}

// Gerar dados para a tabela client_custom_values
async function seedClientCustomValues(contacts, customFields) {
  console.log('Gerando valores personalizados para clientes...');
  
  const customValues = [];
  
  // Primeiro, verificar quais contatos realmente existem no banco de dados
  const { data: existingContacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id')
    .in('id', contacts.map(c => c.id));
  
  if (contactsError) {
    console.error('Erro ao verificar contatos existentes:', contactsError.message);
    return [];
  }
  
  console.log(`Encontrados ${existingContacts.length} contatos válidos no banco de dados`);
  
  // Mapear IDs de contatos existentes para uso rápido
  const validContactIds = new Set(existingContacts.map(c => c.id));
  
  // Para cada contato válido, adicionar valores para alguns campos personalizados
  for (const contact of contacts) {
    // Pular contatos que não existem no banco de dados
    if (!validContactIds.has(contact.id)) {
      continue;
    }
    
    // Escolher aleatoriamente 2-5 campos para preencher
    const fieldsToUse = customFields
      .sort(() => 0.5 - Math.random())
      .slice(0, randomInt(2, Math.min(5, customFields.length)));
    
    for (const field of fieldsToUse) {
      let fieldValue;
      
      switch (field.field_type) {
        case 'text':
        case 'single_select':
          fieldValue = `Valor para ${contact.name}`;
          break;
        case 'number':
          fieldValue = randomInt(1, 100);
          break;
        case 'date':
          fieldValue = randomDate().split('T')[0];
          break;
        case 'boolean':
          fieldValue = Math.random() > 0.5;
          break;
        case 'select':
        case 'single_select':
          if (field.field_options && Array.isArray(field.field_options)) {
            fieldValue = randomChoice(field.field_options);
          } else if (field.field_name === 'Experiência Náutica') {
            fieldValue = randomChoice(['Iniciante', 'Intermediário', 'Avançado']);
          } else if (field.field_name === 'Tipo de Embarcação') {
            fieldValue = randomChoice(['Lancha', 'Veleiro', 'Iate', 'Jet Ski']);
          } else if (field.field_name === 'Faixa de Preço') {
            fieldValue = randomChoice(['Até R$ 100 mil', 'R$ 100-500 mil', 'R$ 500 mil-1 milhão', 'Acima de R$ 1 milhão']);
          } else {
            fieldValue = 'Opção 1';
          }
          break;
        case 'multi_select':
          if (field.field_name === 'Atividades Preferidas') {
            const options = ['Pesca', 'Mergulho', 'Passeio', 'Esportes Comercials', 'Festas'];
            const numOptions = randomInt(1, 3);
            fieldValue = Array.from({length: numOptions}, () => randomChoice(options));
          } else if (field.field_name === 'Documentos Enviados') {
            const options = ['RG', 'CPF', 'Comprovante de Residência', 'Habilitação Náutica'];
            const numOptions = randomInt(1, 3);
            fieldValue = Array.from({length: numOptions}, () => randomChoice(options));
          } else if (field.field_options && Array.isArray(field.field_options)) {
            const numOptions = randomInt(1, Math.min(3, field.field_options.length));
            fieldValue = Array.from({length: numOptions}, () => randomChoice(field.field_options));
          } else {
            fieldValue = ['Opção 1', 'Opção 2'];
          }
          break;
        default:
          fieldValue = 'Valor padrão';
      }
      
      customValues.push({
        id: uuidv4(),
        client_id: contact.id,
        field_id: field.id,
        field_value: fieldValue,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }
  
  if (customValues.length > 0) {
    // Inserir em lotes de 20
    const batchSize = 20;
    for (let i = 0; i < customValues.length; i += batchSize) {
      const batch = customValues.slice(i, i + batchSize);
      const { data, error } = await supabase.from('client_custom_values').insert(batch);
      
      if (error) {
        console.error(`Erro ao inserir lote de valores personalizados ${i}-${i + batch.length}:`, error.message);
      } else {
        console.log(`Inseridos valores personalizados ${i + 1}-${i + batch.length}`);
      }
    }
  }
  
  return customValues;
}

// Gerar dados para a tabela custom_field_audit_log
async function seedCustomFieldAuditLog(customValues) {
  console.log('Gerando logs de auditoria para campos personalizados...');
  
  const auditLogs = [];
  const changeTypes = ['create', 'update', 'delete'];
  const users = ['Gabriel Calebe', 'Ana Costa', 'Lucas Mendes', 'Mariana Oliveira', 'Rafael Santos', 'Sistema'];
  
  // Para cada valor personalizado, criar 1-3 logs de auditoria
  for (const value of customValues) {
    if (Math.random() > 0.7) { // Apenas para alguns valores
      const numLogs = randomInt(1, 3);
      
      for (let i = 0; i < numLogs; i++) {
        const changeType = i === 0 ? 'create' : randomChoice(changeTypes.slice(1));
        let oldValue = null;
        let newValue = value.field_value;
        
        if (changeType === 'update') {
          oldValue = typeof value.field_value === 'number' 
            ? value.field_value - randomInt(1, 10) 
            : (typeof value.field_value === 'string' 
              ? `Valor anterior de ${value.field_value}` 
              : value.field_value);
        } else if (changeType === 'delete') {
          newValue = null;
          oldValue = value.field_value;
        }
        
        auditLogs.push({
          id: uuidv4(),
          client_id: value.client_id,
          field_id: value.field_id,
          change_type: changeType,
          old_value: oldValue,
          new_value: newValue,
          changed_by: randomChoice(users),
          created_at: randomDate()
        });
      }
    }
  }
  
  if (auditLogs.length > 0) {
    const { data, error } = await supabase.from('custom_field_audit_log').insert(auditLogs);
    
    if (error) {
      console.error('Erro ao inserir logs de auditoria:', error.message);
    } else {
      console.log(`Inseridos ${auditLogs.length} logs de auditoria`);
    }
  }
  
  return auditLogs;
}

// Função principal para preencher todas as tabelas vazias
async function seedDatabase() {
  console.log('=== PREENCHENDO TABELAS VAZIAS NO SUPABASE ===');
  console.log('URL:', supabaseUrl);
  
  try {
    // 1. Buscar campos personalizados existentes
    const { data: customFields, error: customFieldsError } = await supabase
      .from('custom_fields')
      .select('*');
    
    if (customFieldsError) {
      throw new Error(`Erro ao buscar campos personalizados: ${customFieldsError.message}`);
    }
    
    console.log(`Encontrados ${customFields.length} campos personalizados`);
    
    // 2. Preencher tabela contacts
    const contacts = await seedContacts(20);
    
    // Verificar se os contatos foram inseridos corretamente
    const { data: insertedContacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id')
      .limit(20);
    
    if (contactsError) {
      console.error('Erro ao verificar contatos inseridos:', contactsError.message);
    } else {
      console.log(`Verificados ${insertedContacts.length} contatos inseridos no banco de dados`);
    }
    
    // 3. Preencher tabela utm_tracking
    const utmRecords = await seedUtmTracking(contacts, 30);
    
    // 4. Preencher tabela custom_field_validation_rules
    const validationRules = await seedCustomFieldValidationRules(customFields);
    
    // 5. Preencher tabela client_custom_values
    const customValues = await seedClientCustomValues(insertedContacts || contacts, customFields);
    
    // 6. Preencher tabela custom_field_audit_log
    const auditLogs = await seedCustomFieldAuditLog(customValues);
    
    console.log('\n=== RESUMO DO PREENCHIMENTO ===');
    console.log(`Contatos: ${contacts.length}`);
    console.log(`Registros UTM: ${utmRecords.length}`);
    console.log(`Regras de validação: ${validationRules.length}`);
    console.log(`Valores personalizados: ${customValues.length}`);
    console.log(`Logs de auditoria: ${auditLogs.length}`);
    console.log('\nPreenchimento concluído com sucesso!');
    
  } catch (err) {
    console.error('Erro durante o preenchimento do banco de dados:', err);
  }
}

// Executar o preenchimento
seedDatabase().catch(err => {
  console.error('Erro ao preencher banco de dados:', err);
});