# 📋 Checklist de Refatoração - ValoreDash v1.48

## 🎯 Objetivo
Este checklist guia o processo de refatoração dos arquivos grandes e complexos da aplicação em componentes menores e mais maintíveis.

---

## 🔥 PRIORIDADE ALTA - Arquivos Críticos (>400 linhas)

### 1. ⚠️ `src/pages/ThemeSettings.tsx` (472 linhas)
**Status:** ❌ Pendente

**Problemas identificados:**
- Componente monolítico com múltiplas responsabilidades
- Lógica de upload de arquivos misturada com UI
- Gerenciamento de estado complexo
- Múltiplos handlers em um só componente

**Refatoração sugerida:**
- [ ] Extrair `ThemeSettingsHeader` component
- [ ] Criar `LogoUploadSection` component
- [ ] Separar `ColorCustomizationPanel` component
- [ ] Criar `ThemePreviewSection` component
- [ ] Extrair hook `useThemeSettingsLogic`
- [ ] Separar validações em `utils/themeValidation.ts`

**Arquivos a criar:**
```
src/components/theme/
├── ThemeSettingsHeader.tsx
├── LogoUploadSection.tsx
├── ColorCustomizationPanel.tsx
├── ThemePreviewSection.tsx
└── index.ts

src/hooks/
└── useThemeSettingsLogic.ts

src/utils/
└── themeValidation.ts
```

---

### ✅ 2. `src/hooks/useProducts.ts` (637 linhas) - **CONCLUÍDO**
**Status:** ✅ Concluído

**Problemas identificados:**
- Hook gigante com múltiplas responsabilidades ✅
- Muitas queries e mutations em um só arquivo ✅
- Lógica de negócio misturada com queries ✅
- Difícil manutenção e teste ✅

**Refatoração realizada:**
- [x] Separar em `useProductsQuery.ts`
- [x] Criar `useProductsMutations.ts`
- [x] Extrair `useProductsCache.ts`
- [x] Separar `useProductsValidation.ts`
- [x] Criar `services/productsService.ts`
- [x] Extrair `types/products.ts`

**Arquivos criados:**
```
src/hooks/products/
├── index.ts          # Exportações principais ✅
├── types.ts          # Tipos e interfaces ✅
├── queries.ts        # Funções de busca ✅
├── mutations.ts      # Funções de modificação ✅
├── hooks.ts          # Hooks React Query ✅
└── README.md         # Documentação ✅
```

**Benefícios alcançados:**
- ✅ Separação de responsabilidades (5 arquivos especializados)
- ✅ Melhor testabilidade (funções puras)
- ✅ Reutilização (importações específicas)
- ✅ Compatibilidade mantida (hook legado preservado)
- ✅ Redução de 637 linhas para média de 127 linhas por arquivo

---

### 3. ⚠️ `src/integrations/supabase/types.ts` (4718 linhas)
**Status:** ❌ Pendente

**Problemas identificados:**
- Arquivo de tipos gigantesco
- Dificulta navegação e manutenção
- Tipos não organizados por domínio
- Impacta performance do TypeScript

**Refatoração sugerida:**
- [ ] Separar por domínios de negócio
- [ ] Criar `types/database/` directory
- [ ] Separar enums em arquivo próprio
- [ ] Criar index files para re-exports

**Arquivos a criar:**
```
src/types/database/
├── auth.ts
├── contacts.ts
├── products.ts
├── knowledge.ts
├── calendar.ts
├── metrics.ts
├── enums.ts
└── index.ts
```

---

## 🟡 PRIORIDADE MÉDIA - Componentes Complexos (200-400 linhas)

### ✅ 4. `src/hooks/useEventFormDialog.ts` (304 linhas) - **CONCLUÍDO**
**Status:** ✅ Concluído

**Problemas identificados:**
- Hook complexo com múltiplas responsabilidades ✅
- Lógica de validação misturada com handlers ✅
- Gerenciamento de estado complexo ✅
- Difícil manutenção e teste ✅

**Refatoração realizada:**
- [x] Separar em `eventForm/types.ts`
- [x] Criar `eventForm/eventProcessor.ts`
- [x] Extrair `eventForm/validation.ts`
- [x] Separar `eventForm/handlers.ts`
- [x] Criar `eventForm/utils.ts`
- [x] Extrair `eventForm/hooks.ts`

**Arquivos criados:**
```
src/hooks/eventForm/
├── index.ts          # Exportações principais ✅
├── types.ts          # Tipos e interfaces ✅
├── eventProcessor.ts # Processamento de eventos ✅
├── validation.ts     # Validações do formulário ✅
├── handlers.ts       # Manipuladores de eventos ✅
├── utils.ts          # Funções utilitárias ✅
├── hooks.ts          # Hooks React especializados ✅
└── README.md         # Documentação ✅
```

**Benefícios alcançados:**
- ✅ Separação de responsabilidades (8 arquivos especializados)
- ✅ Melhor testabilidade (funções puras)
- ✅ Reutilização (importações específicas)
- ✅ Compatibilidade mantida (hook legado preservado)
- ✅ Redução de 304 linhas para média de 50-80 linhas por arquivo

### ✅ 5. `src/components/knowledge/agenda/AgendaHierarchicalView.tsx` (279 linhas) - **CONCLUÍDO**
**Status:** ✅ Concluído

**Problemas identificados:**
- Componente monolítico com múltiplas responsabilidades ✅
- Lógica de agrupamento e filtros misturada ✅
- Gerenciamento de estado complexo ✅
- Componentes de UI não reutilizáveis ✅

**Refatoração realizada:**
- [x] Separar em `hierarchical/types.ts`
- [x] Criar `hierarchical/config.ts`
- [x] Extrair `hierarchical/utils.ts`
- [x] Separar `hierarchical/hooks.ts`
- [x] Criar `hierarchical/components.tsx`
- [x] Refatorar `hierarchical/AgendaHierarchicalView.tsx`

**Arquivos criados:**
```
src/components/knowledge/agenda/hierarchical/
├── index.ts                    # Exportações principais ✅
├── types.ts                    # Tipos e interfaces ✅
├── config.ts                   # Configurações e constantes ✅
├── utils.ts                    # Funções utilitárias ✅
├── hooks.ts                    # Hooks React especializados ✅
├── components.tsx              # Componentes individuais ✅
├── AgendaHierarchicalView.tsx  # Componente principal refatorado ✅
└── README.md                   # Documentação ✅
```

**Benefícios alcançados:**
- ✅ Separação de responsabilidades (8 arquivos especializados)
- ✅ Melhor testabilidade (componentes e funções isoladas)
- ✅ Reutilização (componentes e hooks individuais)
- ✅ Compatibilidade mantida (wrapper de compatibilidade)
- ✅ Redução de 279 linhas para média de 150-200 linhas por arquivo
- ✅ Funcionalidades avançadas (acessibilidade, performance, exportação)

### 6. `src/components/knowledge/tabs/agenda-form/Step6RemindersSettings.tsx` (271 linhas)
**Status:** ❌ Pendente

**Refatoração sugerida:**
- [ ] Extrair `ReminderCard` component
- [ ] Criar `ReminderForm` component
- [ ] Separar `useReminderHandlers` hook
- [ ] Extrair `FileUploadSection` component

### 7. `src/components/Sidebar.tsx` (238 linhas)
**Status:** ❌ Pendente

**Refatoração sugerida:**
- [ ] Extrair `SidebarHeader` component
- [ ] Criar `SidebarMenuSection` component
- [ ] Separar `SidebarMenuItem` component
- [ ] Extrair `useSidebarNavigation` hook

---

## 🟢 PRIORIDADE BAIXA - Headers Repetitivos (180-200 linhas)

### 8. Headers com padrão similar - Candidatos para abstração
**Status:** ❌ Pendente

**Arquivos identificados:**
- `src/components/knowledge/personality/PersonalityHeader.tsx` (196 linhas)
- `src/components/knowledge/products/ProductsHeader.tsx` (193 linhas)
- `src/components/knowledge/hosts/HostsHeader.tsx` (190 linhas)
- `src/components/knowledge/faq/FAQHeader.tsx` (181 linhas)
- `src/components/knowledge/agenda/AgendaHeader.tsx` (181 linhas)

**Refatoração sugerida:**
- [ ] Criar `BaseHeader` component genérico
- [ ] Extrair `HeaderActions` component
- [ ] Criar `SearchAndFilters` component
- [ ] Separar `ViewModeToggle` component
- [ ] Criar hook `useHeaderLogic`

**Arquivos a criar:**
```
src/components/common/headers/
├── BaseHeader.tsx
├── HeaderActions.tsx
├── SearchAndFilters.tsx
├── ViewModeToggle.tsx
└── index.ts

src/hooks/
└── useHeaderLogic.ts
```

---

## 🧹 LIMPEZA DE CÓDIGO

### 9. Arquivos com Suppressões TypeScript
**Status:** ❌ Pendente

**Arquivos identificados:**
- `src/lib/typeSuppressions.ts` (86 linhas)
- `src/types/typeFixtures.ts` (200 linhas)
- `src/types/suppressions.ts` (61 linhas)
- `src/lib/typeFixSuppressions.ts` (25 linhas)

**Ações necessárias:**
- [ ] Revisar e corrigir tipos adequadamente
- [ ] Remover `@ts-nocheck` desnecessários
- [ ] Implementar tipos corretos
- [ ] Remover arquivos de supressão

### 10. Hooks com Cache Global
**Status:** ❌ Pendente

**Arquivos identificados:**
- `src/hooks/useOptimizedContactsData.ts` (152 linhas)
- `src/hooks/useOptimizedHosts.ts` (110 linhas)

**Refatoração sugerida:**
- [ ] Migrar para React Query/TanStack Query
- [ ] Remover cache global manual
- [ ] Implementar invalidação adequada
- [ ] Padronizar com outros hooks

---

## 📊 MÉTRICAS DE PROGRESSO

### Arquivos por Prioridade:
- **Alta:** 3 arquivos (5,935 linhas total)
- **Média:** 4 arquivos (1,129 linhas total)
- **Baixa:** 5 arquivos (951 linhas total)
- **Limpeza:** 6 arquivos (634 linhas total)

### Status Geral:
- ❌ **Pendente:** 16 arquivos
- ⏳ **Em Progresso:** 0 arquivos
- ✅ **Concluído:** 3 arquivos

**Total de linhas a refatorar:** ~8,370 linhas (279 linhas concluídas)

---

## 🛠️ PROCESSO DE REFATORAÇÃO

### Etapas para cada arquivo:

1. **📋 Planejamento**
   - [ ] Analisar responsabilidades do componente
   - [ ] Identificar pontos de separação
   - [ ] Definir nova estrutura de arquivos

2. **🔧 Implementação**
   - [ ] Criar novos arquivos menores
   - [ ] Mover lógica específica
   - [ ] Implementar testes unitários
   - [ ] Atualizar imports/exports

3. **✅ Validação**
   - [ ] Testar funcionalidade
   - [ ] Verificar performance
   - [ ] Revisar código
   - [ ] Atualizar documentação

4. **🧹 Limpeza**
   - [ ] Remover código antigo
   - [ ] Atualizar dependências
   - [ ] Verificar ESLint/TypeScript
   - [ ] Commit das mudanças

---

## 📝 NOTAS IMPORTANTES

- **Backup:** Sempre criar branch antes de refatorar
- **Testes:** Implementar testes antes de quebrar componentes
- **Performance:** Monitorar impacto na performance
- **Compatibilidade:** Manter APIs existentes durante transição
- **Documentação:** Atualizar README e documentação técnica

---

## 🎯 BENEFÍCIOS ESPERADOS

- ✅ **Manutenibilidade:** Código mais fácil de manter
- ✅ **Testabilidade:** Componentes menores são mais fáceis de testar
- ✅ **Reusabilidade:** Componentes menores podem ser reutilizados
- ✅ **Performance:** Melhor tree-shaking e lazy loading
- ✅ **Developer Experience:** Navegação mais fácil no código
- ✅ **TypeScript:** Melhor performance do compilador

---

**Última atualização:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Responsável:** Equipe de Desenvolvimento
**Status do Projeto:** 🟡 Em Progresso (3/19 arquivos concluídos - 15.8%)