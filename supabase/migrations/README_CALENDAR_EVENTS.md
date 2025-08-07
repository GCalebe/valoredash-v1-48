# Integração de Appointments com Calendar Events

## Visão Geral

Este documento explica a implementação da integração entre `appointments` e `calendar_events` no sistema ValoreDash. A integração permite que os compromissos (appointments) apareçam automaticamente no calendário do sistema.

## Problema Resolvido

Anteriormente, os compromissos criados na tabela `appointments` não apareciam automaticamente no calendário do sistema, que utiliza a tabela `calendar_events` para exibir eventos. Isso criava uma experiência fragmentada para os usuários, que precisavam gerenciar seus compromissos em dois lugares diferentes.

## Solução Implementada

A solução implementa um mecanismo automático que:

1. Cria registros correspondentes na tabela `calendar_events` para cada novo compromisso criado
2. Atualiza a coluna `calendar_event_id` nos `appointments` existentes
3. Mantém os dados sincronizados através de triggers no banco de dados
4. Atualiza eventos de calendário existentes quando os compromissos são modificados

## Componentes da Solução

### 1. Função do PostgreSQL

A função `create_calendar_event_from_appointment()` é responsável por:

- Criar um novo registro na tabela `calendar_events` com os dados do appointment quando não existe um calendar_event_id
- Atualizar um registro existente na tabela `calendar_events` quando o appointment já possui um calendar_event_id
- Retornar o ID do novo evento para ser armazenado no appointment (apenas para novos eventos)

### 2. Triggers do PostgreSQL

Dois triggers foram implementados:

- `appointment_calendar_event_trigger`: Acionado ANTES da inserção de um novo appointment
- `appointment_calendar_event_update_trigger`: Acionado ANTES da atualização de um appointment existente

Estes triggers garantem que qualquer novo appointment ou alteração em appointments existentes seja refletida automaticamente na tabela `calendar_events`.

### 3. Migração para Dados Existentes

Um bloco de código PL/pgSQL foi implementado para processar todos os appointments existentes que ainda não possuem um `calendar_event_id`, criando os registros correspondentes na tabela `calendar_events` e atualizando os appointments.

## Como Funciona

1. Quando um novo appointment é criado, o trigger `appointment_calendar_event_trigger` é acionado
2. A função `create_calendar_event_from_appointment()` cria um novo registro na tabela `calendar_events`
3. O ID do novo evento é automaticamente atribuído à coluna `calendar_event_id` do appointment
4. Quando um appointment existente é atualizado, o trigger `appointment_calendar_event_update_trigger` é acionado
5. A função verifica se o appointment já possui um calendar_event_id:
   - Se possuir, atualiza o registro existente na tabela `calendar_events`
   - Se não possuir, cria um novo registro e atualiza o appointment

## Campos Mapeados

| Appointment (origem) | Calendar Event (destino) | Descrição |
|---------------------|--------------------------|------------|
| appointment_type    | title                    | Título do evento |
| notes               | description              | Descrição do evento |
| appointment_date    | start_time               | Data/hora de início |
| appointment_date + duration_minutes | end_time | Data/hora de término |
| status              | status                   | Status do evento |
| contact_id          | contact_id               | ID do contato relacionado |
| user_id             | user_id                  | ID do usuário proprietário |
| assigned_user       | host_name                | Nome do responsável pelo evento |

## Benefícios

- Experiência unificada para o usuário: todos os compromissos aparecem automaticamente no calendário
- Eliminação de duplicação de dados e esforço manual
- Manutenção automática da sincronização entre as duas tabelas
- Processamento eficiente através de triggers no banco de dados
- Atualizações bidirecionais: modificações em appointments são refletidas nos eventos de calendário

## Correções Implementadas

A versão atual inclui as seguintes correções em relação à implementação original:

1. Correção do tipo de dados para o campo `end_time` na tabela `calendar_events` (removida a conversão para texto)
2. Implementação da lógica de atualização de eventos existentes quando um appointment é modificado
3. Tratamento adequado de UUIDs para campos como `contact_id`, `user_id` e `assigned_user`
4. Validação dos valores permitidos para o campo `appointment_type`