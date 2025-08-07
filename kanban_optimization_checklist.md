# Checklist de Otimizações para o Sistema Kanban

Este documento contém um checklist detalhado das melhorias recomendadas para otimizar o desempenho do sistema Kanban. As otimizações estão organizadas por categorias e incluem tanto melhorias de banco de dados quanto de frontend.

## 1. Otimizações de Banco de Dados

### 1.1 Índices

- [ ] Executar o script SQL `kanban_optimization_sql.sql` para criar os seguintes índices:
  - [ ] `idx_contacts_user_stage_created` - Índice composto para otimizar consultas que filtram por user_id, kanban_stage_id e ordenam por created_at
  - [ ] `idx_contacts_user_stage_count` - Índice para otimizar consultas de contagem por estágio do Kanban
  - [ ] `idx_contacts_search` - Índice para melhorar a performance de buscas por texto
  - [ ] `idx_contacts_tags` - Índice para otimizar consultas que filtram por tags
  - [ ] `idx_kanban_stages_user_ordering` - Índice para otimizar consultas na tabela kanban_stages

- [ ] Executar `ANALYZE` nas tabelas após criar os índices para atualizar as estatísticas do planejador de consultas

### 1.2 Consultas

- [ ] Revisar e otimizar a função `fetchContactsList` em `optimizedContactsService.ts`:
  - [ ] Implementar paginação eficiente com cursor (usando `created_at` e `id` como referência)
  - [ ] Limitar o número de colunas retornadas nas consultas iniciais (SELECT apenas campos necessários)
  - [ ] Adicionar opção de lazy loading para campos grandes ou raramente utilizados

- [ ] Otimizar a função `getContactsStats` para usar os novos índices

## 2. Otimizações de Cache

### 2.1 Ajustes no Cache Global

- [ ] Revisar a duração do cache global em `useOptimizedContactsData.ts` (atualmente 5 minutos)
  - [ ] Considerar ajustar o tempo com base no padrão de uso da aplicação
  - [ ] Implementar invalidação seletiva do cache (apenas para os estágios afetados)

### 2.2 React Query

- [ ] Configurar o React Query para otimizar o cache:
  - [ ] Ajustar `staleTime` e `cacheTime` para reduzir chamadas desnecessárias à API
  - [ ] Implementar invalidação seletiva de queries
  - [ ] Utilizar `prefetchQuery` para dados previsíveis (como estágios do Kanban)

## 3. Otimizações de Renderização

### 3.1 Virtualização

- [ ] Implementar virtualização para o componente `KanbanView.tsx`:
  - [ ] Utilizar `react-window` ou `react-virtualized` para renderizar apenas os cartões visíveis
  - [ ] Implementar lazy loading horizontal para estágios fora da viewport

### 3.2 Memoização

- [ ] Adicionar `React.memo` aos componentes:
  - [ ] `KanbanClientCard.tsx`
  - [ ] `ClientCard.tsx`
  - [ ] `KanbanStageColumn.tsx`

- [ ] Otimizar props com `useMemo` e `useCallback`:
  - [ ] Funções de manipulação de eventos (drag and drop)
  - [ ] Funções de filtragem e ordenação

### 3.3 Otimização de Re-renderizações

- [ ] Implementar Context API ou Redux para gerenciar o estado global:
  - [ ] Separar o estado por estágios do Kanban para evitar re-renderizações desnecessárias
  - [ ] Utilizar seletores para acessar apenas os dados necessários

## 4. Otimizações de Dados

### 4.1 Carregamento Progressivo

- [ ] Implementar carregamento progressivo de dados:
  - [ ] Carregar inicialmente apenas os dados essenciais dos contatos
  - [ ] Carregar detalhes adicionais sob demanda (ao expandir um cartão)

### 4.2 Compressão de Dados

- [ ] Otimizar o formato de dados trafegados:
  - [ ] Reduzir campos redundantes
  - [ ] Considerar compressão para grandes conjuntos de dados

## 5. Monitoramento de Performance

- [ ] Implementar métricas de performance:
  - [ ] Tempo de carregamento inicial do Kanban
  - [ ] Tempo de resposta para operações de drag and drop
  - [ ] Uso de memória durante a interação com o Kanban

- [ ] Adicionar logging para identificar gargalos:
  - [ ] Tempo de execução de consultas
  - [ ] Tempo de renderização de componentes

## 6. Implementação de Melhorias Específicas

### 6.1 Melhorias no Componente KanbanView

- [ ] Otimizar a função `handleDragEnd`:
  - [ ] Reduzir a complexidade da lógica de atualização otimista
  - [ ] Melhorar o tratamento de erros e rollback

- [ ] Melhorar o mecanismo de scroll horizontal:
  - [ ] Implementar scroll virtual para grandes quantidades de estágios
  - [ ] Otimizar a detecção de eventos de mouse para scroll mais suave

### 6.2 Melhorias no Componente ClientCard

- [ ] Otimizar a renderização condicional:
  - [ ] Usar técnicas como lazy loading para componentes internos
  - [ ] Implementar skeleton loading para dados que ainda não foram carregados

## 7. Testes e Validação

- [ ] Realizar testes de performance antes e depois das otimizações:
  - [ ] Medir tempo de carregamento inicial
  - [ ] Medir tempo de resposta para operações de drag and drop
  - [ ] Medir uso de memória durante a interação com o Kanban

- [ ] Validar as otimizações com diferentes volumes de dados:
  - [ ] Testar com poucos contatos (< 100)
  - [ ] Testar com volume médio de contatos (100-1000)
  - [ ] Testar com grande volume de contatos (> 1000)

## Notas Adicionais

- As otimizações devem ser implementadas incrementalmente, medindo o impacto de cada mudança.
- Priorizar as otimizações que trarão maior impacto com menor risco.
- Manter a compatibilidade com a API existente para evitar quebrar outras partes da aplicação.
- Documentar todas as alterações realizadas para facilitar a manutenção futura.