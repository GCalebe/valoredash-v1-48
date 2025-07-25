-- Script SQL para inserir 5 clientes de exemplo
-- Execute este script diretamente no Supabase SQL Editor

-- Inserir clientes de exemplo na tabela contacts
INSERT INTO contacts (
  name,
  email,
  phone,
  client_name,
  client_type,
  cpf_cnpj,
  consultation_stage,
  status,
  budget,
  client_sector,
  tags,
  notes,
  user_id
) VALUES 
(
  'João Silva',
  'joao.silva@email.com',
  '(11) 99999-1111',
  'Silva Consultoria',
  'pessoa-juridica',
  '12.345.678/0001-90',
  'Agendamento',
  'Active',
  15000,
  'Consultoria',
  ARRAY['novo-cliente', 'consultoria'],
  'Cliente interessado em consultoria empresarial',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  'Maria Santos',
  'maria.santos@email.com',
  '(11) 99999-2222',
  'Santos & Associados',
  'pessoa-juridica',
  '98.765.432/0001-10',
  'Proposta',
  'Active',
  25000,
  'Advocacia',
  ARRAY['qualificado', 'advocacia'],
  'Escritório de advocacia interessado em automação',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  'Pedro Costa',
  'pedro.costa@email.com',
  '(11) 99999-3333',
  'Costa Tech',
  'pessoa-juridica',
  '11.222.333/0001-44',
  'Negociação',
  'Active',
  50000,
  'Tecnologia',
  ARRAY['tecnologia', 'negociacao'],
  'Startup de tecnologia em fase de crescimento',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  'Ana Oliveira',
  'ana.oliveira@email.com',
  '(11) 99999-4444',
  'Oliveira Educação',
  'pessoa-juridica',
  '55.666.777/0001-88',
  'Fechado',
  'Active',
  30000,
  'Educação',
  ARRAY['fechado', 'educacao'],
  'Instituição de ensino que fechou contrato',
  '550e8400-e29b-41d4-a716-446655440000'
),
(
  'Carlos Ferreira',
  'carlos.ferreira@email.com',
  '(11) 99999-5555',
  'Ferreira Comércio',
  'pessoa-juridica',
  '99.888.777/0001-66',
  'Perdido',
  'Inactive',
  10000,
  'Comércio',
  ARRAY['perdido', 'comercio'],
  'Cliente que não avançou no processo',
  '550e8400-e29b-41d4-a716-446655440000'
);

-- Verificar se os clientes foram inseridos
SELECT 
  id,
  name,
  email,
  client_name,
  consultation_stage,
  status,
  budget,
  created_at
FROM contacts 
WHERE email IN (
  'joao.silva@email.com',
  'maria.santos@email.com', 
  'pedro.costa@email.com',
  'ana.oliveira@email.com',
  'carlos.ferreira@email.com'
)
ORDER BY created_at DESC;