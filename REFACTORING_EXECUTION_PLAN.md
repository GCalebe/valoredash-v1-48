# 🚀 Plano de Execução - Refatoração ValoreDash v1.48

## 📅 Cronograma de Implementação (4 Semanas)

---

## 🗓️ SEMANA 1: Preparação e Hooks Críticos

### Dia 1-2: Setup e Análise
- [ ] **Configurar ambiente de refatoração**
  - Criar branch `refactor/modular-architecture`
  - Configurar scripts de análise de complexidade
  - Backup completo do código atual

- [ ] **Análise detalhada dos arquivos prioritários**
  - Executar análise de complexidade
  - Mapear dependências entre componentes
  - Identificar pontos de quebra seguros

### Dia 3-5: Refatoração de Hooks Críticos

#### 🎯 PRIORIDADE ALTA: useProducts.ts (637 linhas)

**Estrutura alvo:**
```
src/hooks/products/
├── index.ts                    # Barrel exports
├── useProductsQuery.ts         # Queries (150 linhas)
├── useProductsMutations.ts     # Mutations (120 linhas)
├── useProductsValidation.ts    # Validações (80 linhas)
├── useProductsCache.ts         # Cache management (70 linhas)
└── types.ts                    # Types específicos (50 linhas)
```

**Checklist de execução:**
- [ ] Criar estrutura de diretórios
- [ ] Extrair queries para `useProductsQuery.ts`
- [ ] Extrair mutations para `useProductsMutations.ts`
- [ ] Extrair validações para `useProductsValidation.ts`
- [ ] Extrair lógica de cache para `useProductsCache.ts`
- [ ] Criar barrel export em `index.ts`
- [ ] Atualizar imports nos componentes
- [ ] Executar testes de regressão

#### 🎯 PRIORIDADE ALTA: useEventFormDialog.ts (304 linhas)

**Estrutura alvo:**
```
src/hooks/events/
├── index.ts
├── useEventFormDialog.ts       # Dialog logic (100 linhas)
├── useEventValidation.ts       # Validações (80 linhas)
├── useEventMutations.ts        # CRUD operations (90 linhas)
└── types.ts                    # Event types (40 linhas)
```

**Checklist de execução:**
- [ ] Separar lógica de dialog
- [ ] Extrair validações de formulário
- [ ] Separar operações CRUD
- [ ] Atualizar componentes dependentes
- [ ] Testar funcionalidade completa

---

## 🗓️ SEMANA 2: Componentes de Interface

### Dia 1-3: Headers Padronizados

#### 🎯 Criar Sistema de Headers Reutilizáveis

**Estrutura alvo:**
```
src/components/common/headers/
├── index.ts
├── BaseHeader.tsx              # Header base (40 linhas)
├── SearchAndFilters.tsx        # Busca e filtros (60 linhas)
├── HeaderActions.tsx           # Ações comuns (50 linhas)
└── types.ts                    # Interfaces (30 linhas)
```

**Refatorar headers existentes:**
- [ ] **FAQHeader.tsx** (181 → 60 linhas)
- [ ] **HostsHeader.tsx** (196 → 70 linhas)
- [ ] **ProductsHeader.tsx** (189 → 65 linhas)
- [ ] **AgendaHeader.tsx** (184 → 68 linhas)
- [ ] **PersonalityHeader.tsx** (196 → 72 linhas)

### Dia 4-5: Componentes Complexos

#### 🎯 PRIORIDADE ALTA: Step6RemindersSettings.tsx (271 linhas)

**Estrutura alvo:**
```
src/components/knowledge/agenda-form/step6/
├── index.ts
├── Step6RemindersSettings.tsx  # Container (80 linhas)
├── RemindersList.tsx           # Lista de lembretes (70 linhas)
├── ReminderForm.tsx            # Formulário (60 linhas)
├── ReminderItem.tsx            # Item individual (40 linhas)
└── hooks/
    ├── useRemindersLogic.ts    # Lógica de negócio (90 linhas)
    └── useReminderValidation.ts # Validações (50 linhas)
```

#### 🎯 PRIORIDADE ALTA: AgendaHierarchicalView.tsx (279 linhas)

**Estrutura alvo:**
```
src/components/knowledge/agenda/hierarchical/
├── index.ts
├── AgendaHierarchicalView.tsx  # Container (90 linhas)
├── CategoryGroup.tsx           # Grupo de categoria (60 linhas)
├── AgendaItem.tsx             # Item de agenda (50 linhas)
├── HierarchyControls.tsx      # Controles (40 linhas)
└── hooks/
    ├── useHierarchyLogic.ts   # Lógica de agrupamento (80 linhas)
    └── useAgendaFiltering.ts  # Filtros (60 linhas)
```

---

## 🗓️ SEMANA 3: Páginas e Sidebar

### Dia 1-3: Refatoração da Sidebar

#### 🎯 PRIORIDADE MÉDIA: Sidebar.tsx (238 linhas)

**Estrutura alvo:**
```
src/components/layout/sidebar/
├── index.ts
├── Sidebar.tsx                 # Container (80 linhas)
├── SidebarHeader.tsx          # Cabeçalho (40 linhas)
├── NavigationMenu.tsx         # Menu principal (60 linhas)
├── UserProfile.tsx            # Perfil do usuário (35 linhas)
└── hooks/
    └── useSidebarLogic.ts     # Lógica de navegação (50 linhas)
```

### Dia 4-5: Página de Configurações

#### 🎯 PRIORIDADE ALTA: ThemeSettings.tsx (472 linhas)

**Estrutura alvo:**
```
src/pages/theme-settings/
├── index.ts
├── ThemeSettings.tsx           # Container (100 linhas)
├── components/
│   ├── ThemeSettingsHeader.tsx # Cabeçalho (40 linhas)
│   ├── LogoUploadSection.tsx   # Upload de logo (80 linhas)
│   ├── ColorCustomization.tsx  # Cores (90 linhas)
│   ├── ThemePreview.tsx        # Preview (70 linhas)
│   └── AdvancedSettings.tsx    # Configurações avançadas (60 linhas)
└── hooks/
    ├── useThemeSettingsLogic.ts # Lógica principal (120 linhas)
    ├── useLogoUpload.ts        # Upload logic (60 linhas)
    └── useColorManagement.ts   # Gestão de cores (50 linhas)
```

---

## 🗓️ SEMANA 4: Otimização e Validação

### Dia 1-2: Otimizações Finais

- [ ] **Análise de bundle size**
  - Verificar impacto no tamanho final
  - Otimizar imports desnecessários
  - Implementar lazy loading onde apropriado

- [ ] **Performance audit**
  - Executar Lighthouse audit
  - Verificar re-renders desnecessários
  - Otimizar hooks com useMemo/useCallback

### Dia 3-4: Testes e Validação

- [ ] **Testes unitários**
  - Criar testes para novos hooks
  - Atualizar testes existentes
  - Garantir 80%+ de cobertura

- [ ] **Testes de integração**
  - Testar fluxos completos
  - Validar funcionalidades críticas
  - Testes de regressão visual

### Dia 5: Deploy e Monitoramento

- [ ] **Preparação para produção**
  - Code review completo
  - Merge para branch principal
  - Deploy em ambiente de staging

- [ ] **Monitoramento pós-deploy**
  - Configurar alertas de performance
  - Monitorar métricas de usuário
  - Documentar melhorias alcançadas

---

## 📊 MÉTRICAS DE SUCESSO

### Objetivos Quantitativos

| Métrica | Estado Atual | Meta | Como Medir |
|---------|--------------|------|------------|
| **Arquivos >200 linhas** | 8 arquivos | 2 arquivos | Análise estática |
| **Complexidade média** | 15+ | <10 | ESLint complexity |
| **Tempo de build** | Baseline | -15% | CI/CD metrics |
| **Bundle size** | Baseline | Manter ou -5% | Webpack analyzer |
| **Cobertura de testes** | 65% | 80% | Jest coverage |
| **Tempo de desenvolvimento** | Baseline | -25% | Developer survey |

### Objetivos Qualitativos

- [ ] **Manutenibilidade:** Código mais fácil de entender e modificar
- [ ] **Reutilização:** Componentes reutilizáveis entre diferentes seções
- [ ] **Testabilidade:** Componentes menores e mais focados
- [ ] **Performance:** Melhor lazy loading e code splitting
- [ ] **Developer Experience:** Desenvolvimento mais rápido de novas features

---

## 🛠️ FERRAMENTAS E SCRIPTS

### Scripts PowerShell para Automação

```powershell
# refactor-helper.ps1

# Função para criar estrutura de componente
function New-ComponentStructure {
    param(
        [string]$ComponentName,
        [string]$BasePath
    )
    
    $componentDir = "$BasePath/$ComponentName"
    New-Item -ItemType Directory -Path "$componentDir" -Force
    New-Item -ItemType Directory -Path "$componentDir/components" -Force
    New-Item -ItemType Directory -Path "$componentDir/hooks" -Force
    
    # Criar index.ts
    @"
export * from './$ComponentName';
export * from './components';
export * from './hooks';
"@ | Out-File "$componentDir/index.ts"
    
    Write-Host "✅ Estrutura criada: $componentDir" -ForegroundColor Green
}

# Função para analisar complexidade
function Get-ComplexityReport {
    $files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"
    
    $report = $files | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $lines = ($content -split "`n").Count
        
        [PSCustomObject]@{
            File = $_.Name
            Path = $_.FullName
            Lines = $lines
            Status = if ($lines -gt 200) { "🔴 REFACTOR" } elseif ($lines -gt 150) { "🟡 REVIEW" } else { "🟢 OK" }
        }
    }
    
    $report | Sort-Object Lines -Descending | Format-Table -AutoSize
}

# Função para validar refatoração
function Test-RefactorSuccess {
    Write-Host "🧪 Executando validações..." -ForegroundColor Yellow
    
    # Executar testes
    npm test -- --coverage --watchAll=false
    
    # Verificar build
    npm run build
    
    # Análise de bundle
    npm run analyze
    
    Write-Host "✅ Validações concluídas!" -ForegroundColor Green
}
```

### Comandos Úteis

```bash
# Análise de complexidade
npx ts-prune                    # Encontrar exports não utilizados
npx madge --circular src/       # Detectar dependências circulares
npx webpack-bundle-analyzer build/static/js/*.js  # Analisar bundle

# Testes e qualidade
npm run test:coverage           # Cobertura de testes
npm run lint:fix               # Corrigir problemas de lint
npm run type-check             # Verificar tipos TypeScript
```

---

## 🚨 RISCOS E MITIGAÇÕES

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|----------|
| **Quebra de funcionalidade** | Média | Alto | Testes extensivos + rollback plan |
| **Aumento do bundle size** | Baixa | Médio | Análise contínua + tree shaking |
| **Conflitos de merge** | Alta | Baixo | Refatoração incremental |
| **Regressão de performance** | Baixa | Alto | Performance testing + monitoring |
| **Resistência da equipe** | Média | Médio | Treinamento + documentação |

### Plano de Rollback

1. **Backup completo** antes de iniciar
2. **Commits atômicos** para cada refatoração
3. **Feature flags** para mudanças críticas
4. **Monitoramento** de métricas em produção
5. **Rollback automático** se métricas degradarem

---

## 📚 RECURSOS E DOCUMENTAÇÃO

### Links Úteis

- [React Refactoring Patterns](https://react-patterns.com/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Testing Library Guidelines](https://testing-library.com/docs/)
- [Bundle Optimization Guide](https://webpack.js.org/guides/code-splitting/)

### Documentação Interna

- `REFACTORING_CHECKLIST.md` - Lista detalhada de tarefas
- `REFACTORING_STRATEGIES.md` - Padrões e templates
- `REFACTORING_EXECUTION_PLAN.md` - Este documento

---

**📅 Data de criação:** 2025-01-04  
**👥 Responsável:** Equipe de Desenvolvimento  
**🔄 Próxima revisão:** Semanalmente durante execução  
**📊 Status:** Pronto para execução