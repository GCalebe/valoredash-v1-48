# Resumo do Banco de Dados Supabase - Projeto Valore V2

## Informações do Projeto
- **ID do Projeto**: nkyvhwmjuksumizljclc
- **Nome**: comercial247Project
- **Região**: sa-east-1 (São Paulo)
- **Status**: ACTIVE_HEALTHY
- **Versão PostgreSQL**: 17.4.1.042
- **Host**: db.nkyvhwmjuksumizljclc.supabase.co

## Resumo das Tabelas

### 1. **n8n_chat_histories_old** (137 registros)
**Descrição**: Histórico de conversas do N8N (versão antiga)
- **Tamanho**: 112 kB
- **Colunas principais**:
  - `id` (integer, PK): Identificador único
  - `session_id` (text): ID da sessão de chat
  - `message` (jsonb): Conteúdo da mensagem em formato JSON
  - `hora` (timestamptz): Horário da mensagem
  - `data` (timestamptz): Data da mensagem
- **RLS**: Habilitado

### 2. **tokens** (33 registros)
**Descrição**: Controle de uso de tokens de IA
- **Tamanho**: 32 kB
- **Colunas principais**:
  - `id` (bigint, PK): Identificador único
  - `Timestamp` (timestamptz): Data/hora do uso
  - `Workflow` (text): Nome do workflow
  - `Input` (text): Texto de entrada
  - `Output` (text): Texto de saída
  - `PromptTokens` (text): Tokens do prompt
  - `CompletionTokens` (text): Tokens da resposta
  - `CachedTokens` (text): Tokens em cache
  - `CostUSD` (numeric): Custo em dólares
- **RLS**: Habilitado

### 3. **contacts** (7 registros)
**Descrição**: Tabela principal de contatos e clientes
- **Tamanho**: 160 kB
- **Colunas principais**:
  - `id` (uuid, PK): Identificador único
  - `name` (text): Nome do contato
  - `email` (text): Email
  - `phone` (text): Telefone
  - `address` (text): Endereço
  - `client_name` (text): Nome da empresa cliente
  - `client_size` (text): Tamanho da empresa
  - `client_type` (text): Tipo de cliente
  - `cpf_cnpj` (text): CPF ou CNPJ
  - `asaas_customer_id` (text): ID do cliente no Asaas
  - `status` (text): Status do contato (padrão: 'Active')
  - `notes` (text): Observações
  - `last_contact` (timestamptz): Último contato
  - `last_message` (text): Última mensagem
  - `last_message_time` (timestamptz): Horário da última mensagem
  - `unread_count` (integer): Contador de mensagens não lidas
  - `session_id` (text): ID da sessão
  - `tags` (text[]): Tags do contato
  - `responsible_user` (uuid): Usuário responsável
  - `sales` (numeric): Vendas
  - `client_sector` (text): Setor do cliente
  - `budget` (numeric): Orçamento
  - `payment_method` (text): Método de pagamento
  - `kanban_stage` (text): Estágio no kanban
  - `utm_source` (text): Fonte UTM
  - `utm_medium` (text): Meio UTM
  - `utm_campaign` (text): Campanha UTM
  - `utm_term` (text): Termo UTM
  - `utm_content` (text): Conteúdo UTM
  - `created_at` (timestamptz): Data de criação
  - `updated_at` (timestamptz): Data de atualização
- **RLS**: Habilitado

### 4. **documents** (0 registros)
**Descrição**: Armazenamento de documentos com embeddings para IA
- **Tamanho**: 32 kB
- **Colunas principais**:
  - `id` (bigint, PK): Identificador único
  - `content` (text): Conteúdo do documento
  - `metadata` (jsonb): Metadados em JSON
  - `embedding` (vector): Embedding vetorial para busca semântica
  - `titulo` (text): Título do documento
- **RLS**: Habilitado
- **Status**: Tabela vazia

### 5. **imagens_drive** (0 registros)
**Descrição**: Controle de imagens armazenadas no Google Drive
- **Tamanho**: 24 kB
- **Colunas principais**:
  - `id` (integer, PK): Identificador único
  - `nome` (text): Nome da imagem
  - `drive_id` (text, unique): ID único no Google Drive
  - `created_at` (timestamp): Data de criação
- **RLS**: Habilitado
- **Status**: Tabela vazia

## Estatísticas Gerais

- **Total de tabelas**: 5 tabelas principais
- **Total de registros**: 177 registros
- **Tabela com mais dados**: n8n_chat_histories_old (137 registros)
- **Tabelas vazias**: documents, imagens_drive
- **Todas as tabelas têm RLS habilitado** para segurança

## Observações Importantes

1. **Segurança**: Todas as tabelas têm Row Level Security (RLS) habilitado
2. **Histórico de Chat**: A maior parte dos dados está no histórico de conversas do N8N
3. **Controle de Custos**: Sistema de monitoramento de tokens de IA implementado
4. **CRM**: Sistema básico de CRM com gestão de contatos e pipeline de vendas
5. **Integração**: Preparado para integração com Google Drive e sistema de pagamentos Asaas
6. **IA**: Infraestrutura preparada para busca semântica com embeddings

## Próximos Passos Sugeridos

1. Popular a tabela `documents` com conteúdo para busca semântica
2. Implementar upload de imagens para a tabela `imagens_drive`
3. Migrar dados do histórico antigo para nova estrutura de chat
4. Implementar dashboards para análise dos dados de tokens e custos
5. Configurar políticas RLS específicas para cada tipo de usuário

---
*Relatório gerado automaticamente em: " + new Date().toLocaleString('pt-BR') + "*