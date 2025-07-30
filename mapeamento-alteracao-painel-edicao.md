# Mapeamento: Substituição do Modal de Edição pelo Painel de Informações do Cliente

## Objetivo
Substituir o modal atual de edição de cliente (`EditClientForm.tsx`) pelo modelo do painel de informações do cliente da tela de conversas (`ClientInfoPanel.tsx`), mantendo todas as funcionalidades de edição.

## Análise dos Componentes Atuais

### 1. EditClientForm.tsx (Atual)
**Localização:** `src/components/clients/EditClientForm.tsx`

**Estrutura atual:**
- Modal Dialog com título "Editar Cliente: [Nome]"
- Área de conteúdo com ClientInfo
- Botões "Cancelar" e "Salvar Alterações" no rodapé
- Suporte a campos dinâmicos
- Estados de loading e saving

**Props:**
```typescript
interface EditClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContact: Contact | null;
  onSave: (updatedContact: Contact) => Promise<void>;
}
```

### 2. ClientInfoPanel.tsx (Modelo de Referência)
**Localização:** `src/components/chat/ClientInfoPanel.tsx`

**Estrutura do modelo:**
- Header com título "Informações do Cliente"
- ScrollArea com conteúdo
- TagsField (sistema de tags)
- ClientInfo (4 abas: básico, comercial, UTM, personalizado, documentos)
- NotesField (sistema de anotações)
- ValidationErrors (exibição de erros)

**Props:**
```typescript
interface ClientInfoPanelProps {
  selectedChat: string | null;
  selectedConversation: Conversation | undefined;
}
```

## Componentes Necessários para Adaptação

### 1. TagsField.tsx
**Localização:** `src/components/chat/TagsField.tsx`

**Funcionalidades:**
- Adicionar/remover tags coloridas
- 8 cores predefinidas
- Interface com input e seletor de cores

**Adaptações necessárias:**
- Atualmente trabalha com `selectedChat` (string)
- Precisa ser adaptado para trabalhar com `Contact.id`
- Implementar persistência no banco de dados (atualmente só estado local)

### 2. NotesField.tsx
**Localização:** `src/components/chat/NotesField.tsx`

**Funcionalidades:**
- Sistema de anotações com timestamp
- Persistência no campo `notes` da tabela `contacts`
- Interface para adicionar/remover anotações
- ScrollArea para lista de anotações

**Adaptações necessárias:**
- Atualmente usa `selectedChat` → `sessionId` → `contacts.notes`
- Precisa ser adaptado para trabalhar diretamente com `Contact.id`
- Modificar queries para usar `Contact.id` ao invés de `sessionId`

### 3. ValidationErrors.tsx
**Localização:** `src/components/chat/ValidationErrors.tsx`

**Funcionalidades:**
- Exibe erros de validação em tempo real
- Interface visual para feedback de erros

**Adaptações necessárias:**
- Integrar com sistema de validação do contexto de edição
- Adaptar para validações específicas de campos de cliente

### 4. EmptyClientState.tsx e LoadingClientState.tsx
**Localização:** `src/components/chat/`

**Funcionalidades:**
- Estados visuais para loading e empty state

**Adaptações necessárias:**
- Adaptar mensagens para contexto de edição
- Manter consistência visual

## Estrutura do Novo Componente

### EditClientPanel.tsx (Novo)
**Localização:** `src/components/clients/EditClientPanel.tsx`

**Estrutura proposta:**
```typescript
interface EditClientPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContact: Contact | null;
  onSave: (updatedContact: Contact) => Promise<void>;
}
```

**Layout:**
1. **Header**
   - Título: "Editar Cliente: [Nome]"
   - Botão de fechar

2. **ScrollArea com conteúdo:**
   - **TagsField adaptado** (trabalha com Contact.id)
   - **ClientInfo** (4 abas editáveis)
   - **NotesField adaptado** (trabalha com Contact.id)
   - **ValidationErrors** (erros de validação)

3. **Footer fixo:**
   - Botão "Cancelar"
   - Botão "Salvar Alterações"

## Adaptações Específicas Necessárias

### 1. TagsField → TagsFieldEdit
**Arquivo:** `src/components/clients/TagsFieldEdit.tsx`

**Mudanças:**
- Props: `contactId: string` ao invés de `selectedChat`
- Implementar persistência no banco:
  - Criar tabela `contact_tags` ou
  - Adicionar campo JSON `tags` na tabela `contacts`
- Carregar tags existentes do banco
- Salvar alterações automaticamente

### 2. NotesField → NotesFieldEdit
**Arquivo:** `src/components/clients/NotesFieldEdit.tsx`

**Mudanças:**
- Props: `contactId: string` ao invés de `selectedChat`
- Queries diretas para `contacts` usando `id` ao invés de `session_id`
- Remover lógica de conversão `chatId → sessionId`

### 3. ClientInfo (Manter)
**Arquivo:** `src/components/clients/ClientInfo.tsx`

**Configuração:**
- Context: "edit" (já suportado)
- ReadOnly: false
- ShowTabs: ["basic", "commercial", "utm", "custom", "docs"]
- Manter todas as funcionalidades de edição existentes

## Hooks e Serviços

### 1. useDynamicFields
**Localização:** `src/hooks/useDynamicFields.ts`

**Adaptações:**
- Atualmente usa `sessionId`
- Criar versão que aceita `contactId` diretamente
- Ou adaptar para trabalhar com ambos os identificadores

### 2. useClientDataFetch
**Localização:** `src/hooks/useClientDataFetch.ts`

**Adaptações:**
- Criar versão simplificada que trabalha diretamente com `Contact`
- Não precisa de conversão de `conversation → contact`

## Persistência de Dados

### 1. Tags
**Opção 1: Tabela separada**
```sql
CREATE TABLE contact_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id),
  title TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Opção 2: Campo JSON (Recomendado)**
```sql
ALTER TABLE contacts ADD COLUMN tags JSONB DEFAULT '[]';
```

### 2. Anotações (Já existe)
- Campo `notes` na tabela `contacts` (JSONB)
- Estrutura: `[{id, content, timestamp}]`

## Fluxo de Implementação

### Fase 1: Criação dos Componentes Adaptados
1. Criar `TagsFieldEdit.tsx`
2. Criar `NotesFieldEdit.tsx`
3. Adaptar `ValidationErrors.tsx` se necessário

### Fase 2: Criação do Novo Painel
1. Criar `EditClientPanel.tsx`
2. Integrar todos os componentes
3. Implementar lógica de salvamento

### Fase 3: Integração
1. Atualizar `ClientsModals.tsx`
2. Substituir `EditClientForm` por `EditClientPanel`
3. Testar todas as funcionalidades

### Fase 4: Persistência
1. Implementar salvamento de tags
2. Adaptar queries de anotações
3. Testar persistência de dados

## Considerações Técnicas

### 1. Performance
- Manter lazy loading dos componentes
- Otimizar queries de banco
- Implementar debounce para salvamento automático

### 2. UX/UI
- Manter consistência visual
- Preservar estados de loading
- Feedback visual para ações

### 3. Compatibilidade
- Manter compatibilidade com dados existentes
- Migração suave de anotações existentes
- Fallback para casos sem tags

## Arquivos que Serão Modificados

### Novos Arquivos:
- `src/components/clients/EditClientPanel.tsx`
- `src/components/clients/TagsFieldEdit.tsx`
- `src/components/clients/NotesFieldEdit.tsx`

### Arquivos Modificados:
- `src/components/clients/ClientsModals.tsx`
- `src/hooks/useDynamicFields.ts` (possivelmente)

### Arquivos Removidos:
- `src/components/clients/EditClientForm.tsx` (após migração)

## Benefícios da Mudança

1. **Interface mais rica:** Tags e anotações melhoram a gestão de clientes
2. **Consistência visual:** Mesmo padrão usado nas conversas
3. **Melhor organização:** 4 abas bem estruturadas
4. **Funcionalidades avançadas:** Sistema de validação em tempo real
5. **Experiência unificada:** Mesmo padrão de interação em todo o sistema

## Riscos e Mitigações

### Riscos:
1. **Perda de dados:** Durante migração de anotações
2. **Performance:** Componente mais complexo
3. **Compatibilidade:** Quebra de funcionalidades existentes

### Mitigações:
1. **Backup de dados:** Antes de qualquer migração
2. **Testes extensivos:** Validar todas as funcionalidades
3. **Rollback plan:** Manter versão anterior como backup
4. **Implementação gradual:** Por fases com validação

Este mapeamento serve como guia completo para a implementação da nova funcionalidade, garantindo que todos os aspectos sejam considerados antes do desenvolvimento.