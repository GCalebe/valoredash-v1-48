# Event Form Hook Refactoring

## Visão Geral

Este diretório contém a versão refatorada do hook `useEventFormDialog.ts`, que foi dividido em módulos especializados para melhor organização, manutenibilidade e testabilidade.

## Estrutura dos Arquivos

### 📁 Arquivos Principais

- **`types.ts`** - Definições de tipos e interfaces
- **`eventProcessor.ts`** - Processamento de eventos do calendário
- **`validation.ts`** - Funções de validação do formulário
- **`handlers.ts`** - Manipuladores de eventos do formulário
- **`utils.ts`** - Funções utilitárias e helpers
- **`hooks.ts`** - Hooks React especializados
- **`index.ts`** - Exportações centralizadas
- **`README.md`** - Esta documentação

### 🎯 Responsabilidades por Arquivo

#### `types.ts`
- Interfaces para props e retorno do hook
- Tipos para validação e processamento
- Configurações e constantes tipadas
- Enums para estados e tipos de formulário

#### `eventProcessor.ts`
- Extração de informações de eventos existentes
- Processamento de dados do calendário
- Determinação de tipo de atendimento
- Extração de localização e links de reunião

#### `validation.ts`
- Validação de formulário completo
- Validações específicas por seção
- Validação de dados de novo cliente
- Utilitários de validação (email, URL, telefone)

#### `handlers.ts`
- Manipuladores de submissão do formulário
- Handlers de seleção de cliente
- Navegação entre abas
- Gerenciamento de tags
- Controle de diálogos

#### `utils.ts`
- Filtros de contatos
- Utilitários de data e hora
- Formatação de texto
- Funções de cache e performance
- Utilitários gerais (debounce, throttle)

#### `hooks.ts`
- Hook principal `useEventFormDialog`
- Hooks especializados por seção
- Hooks de validação e handlers
- Hooks compostos para funcionalidades específicas

## 🚀 Benefícios da Refatoração

### 1. **Separação de Responsabilidades**
- Cada arquivo tem uma responsabilidade específica
- Código mais organizado e fácil de navegar
- Redução de acoplamento entre funcionalidades

### 2. **Reutilização**
- Funções podem ser reutilizadas em outros contextos
- Hooks especializados para diferentes necessidades
- Utilitários independentes e testáveis

### 3. **Testabilidade**
- Funções isoladas são mais fáceis de testar
- Mocks mais simples e específicos
- Testes unitários mais focados

### 4. **Performance**
- Importações mais específicas
- Possibilidade de lazy loading
- Melhor tree-shaking

### 5. **Manutenibilidade**
- Mudanças isoladas em arquivos específicos
- Menor risco de efeitos colaterais
- Código mais legível e documentado

## 📖 Como Usar

### Uso Básico (Recomendado)

```typescript
import { useEventFormDialog } from '@/hooks/eventForm';

const MyComponent = () => {
  const {
    state,
    validateForm,
    handleSubmit,
    handleSelectClient,
    // ... outras funcionalidades
  } = useEventFormDialog({ event, open });

  // Usar o hook normalmente
};
```

### Uso de Hooks Especializados

```typescript
import { 
  useEventFormClient,
  useEventFormValidation,
  useEventFormDateTime 
} from '@/hooks/eventForm';

const ClientSection = () => {
  const { filteredContacts, selectClient } = useEventFormClient(contacts, state, updateState);
  // ...
};

const ValidationSection = () => {
  const { validateForm, validateNewClientData } = useEventFormValidation(state);
  // ...
};
```

### Uso de Utilitários Específicos

```typescript
import { contactUtils, dateTimeUtils, validationUtils } from '@/hooks/eventForm';

// Filtrar contatos
const filtered = contactUtils.filterContacts({ contacts, searchTerm });

// Formatar data
const formatted = dateTimeUtils.formatDateTime(date, format);

// Validar email
const isValid = validationUtils.validateEmail(email);
```

## 🔄 Compatibilidade com Código Existente

O arquivo original `useEventFormDialog.ts` foi mantido como um wrapper que utiliza a versão refatorada, garantindo que todo código existente continue funcionando sem modificações.

```typescript
// Código existente continua funcionando
import { useEventFormDialog } from '@/hooks/useEventFormDialog';

// Novo código pode usar a versão refatorada
import { useEventFormDialog } from '@/hooks/eventForm';
```

## 🧪 Exemplos de Uso Avançado

### Hook Composto para Seção de Cliente

```typescript
const ClientFormSection = () => {
  const {
    filteredContacts,
    selectClient,
    newClient
  } = useEventFormClient(contacts, state, updateState);

  return (
    <div>
      {filteredContacts.map(contact => (
        <button key={contact.id} onClick={() => selectClient(contact)}>
          {contact.name}
        </button>
      ))}
      <button onClick={newClient}>Novo Cliente</button>
    </div>
  );
};
```

### Validação Específica por Seção

```typescript
const ServiceSection = () => {
  const { validateServiceSelection } = useEventFormValidation(state);
  
  const handleNext = () => {
    if (validateServiceSelection()) {
      // Prosseguir para próxima aba
    }
  };
  
  return (
    <div>
      {/* Campos de serviço */}
      <button onClick={handleNext}>Próximo</button>
    </div>
  );
};
```

### Processamento de Eventos

```typescript
const EventProcessor = () => {
  const { processEvent } = useEventProcessor(contacts, updateState);
  
  useEffect(() => {
    if (calendarEvent) {
      processEvent(calendarEvent);
    }
  }, [calendarEvent]);
  
  return <div>Processando evento...</div>;
};
```

## 📊 Métricas da Refatoração

### Antes da Refatoração
- **1 arquivo** com ~300 linhas
- **Múltiplas responsabilidades** em um único arquivo
- **Difícil testabilidade** devido ao acoplamento
- **Reutilização limitada** de funcionalidades

### Após a Refatoração
- **8 arquivos** especializados
- **~50-80 linhas** por arquivo em média
- **Responsabilidades bem definidas**
- **Alta testabilidade** e reutilização
- **Melhor organização** e manutenibilidade

## 🔧 Configurações Disponíveis

O módulo exporta várias configurações que podem ser customizadas:

```typescript
import { 
  DEFAULT_EVENT_FORM_CONFIG,
  DEBOUNCE_CONFIG,
  CACHE_CONFIG,
  ACCESSIBILITY_CONFIG 
} from '@/hooks/eventForm';

// Configuração padrão do formulário
const config = {
  ...DEFAULT_EVENT_FORM_CONFIG,
  defaultDuration: 90, // Customizar duração padrão
};
```

## 🚦 Próximos Passos

1. **Testes Unitários**: Criar testes para cada módulo
2. **Documentação de API**: Documentar todas as funções exportadas
3. **Otimizações**: Implementar memoização onde necessário
4. **Acessibilidade**: Melhorar suporte a leitores de tela
5. **Internacionalização**: Adicionar suporte a múltiplos idiomas

## 🤝 Contribuindo

Ao modificar este módulo:

1. Mantenha a separação de responsabilidades
2. Adicione testes para novas funcionalidades
3. Atualize a documentação
4. Mantenha compatibilidade com código existente
5. Siga os padrões de nomenclatura estabelecidos

## 📝 Notas Importantes

- O hook original é marcado como `@deprecated` mas mantido para compatibilidade
- Todas as funcionalidades originais foram preservadas
- A performance foi melhorada através de importações específicas
- O código é mais modular e fácil de manter
- Suporte completo a TypeScript com tipos bem definidos