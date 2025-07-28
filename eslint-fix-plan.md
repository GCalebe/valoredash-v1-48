# 🔧 Plano de Correção Prioritizado

## 🤖 Auto-correção Disponível

**0 problemas** podem ser corrigidos automaticamente com:

```bash
npx eslint src --ext .ts,.tsx --fix
```

---

## Fase 1: 🔴 CRÍTICO (10 problemas)

### @typescript-eslint/no-explicit-any (10 ocorrências)

**Estratégia**: Substituir 'any' por tipos específicos

**Arquivos mais afetados**:
- src\components\knowledge\personality\AdvancedSettingsSection.tsx (1 problemas)
- src\components\knowledge\personality\ConfigurationView.tsx (1 problemas)
- src\components\knowledge\personality\ideas\CardBasedConfigurationView.tsx (1 problemas)
- src\components\knowledge\personality\ideas\ModernConfigurationView.tsx (1 problemas)
- src\components\knowledge\personality\ideas\SidebarConfigurationView.tsx (1 problemas)

---

## Fase 2: 🟡 MÉDIO (61 problemas)

### react-hooks/exhaustive-deps (47 ocorrências)

**Estratégia**: Adicionar dependências faltantes no useEffect

**Arquivos mais afetados**:
- src\hooks\useEpisodicMemory.ts (6 problemas)
- src\hooks\useSubscription.ts (3 problemas)
- src\hooks\useAgendaAvailability.ts (2 problemas)
- src\hooks\useEventFormDialog.ts (2 problemas)
- src\hooks\useKanbanStages.ts (2 problemas)

### react-refresh/only-export-components (14 ocorrências)

**Estratégia**: Mover constantes/funções para arquivos separados

**Arquivos mais afetados**:
- src\components\knowledge\tabs\AgendaTab.tsx (2 problemas)
- src\components\animate-ui\base\accordion.tsx (1 problemas)
- src\components\clients\ClientFormValidation.tsx (1 problemas)
- src\components\knowledge\websites\WebsiteCard.tsx (1 problemas)
- src\components\ui\badge.tsx (1 problemas)

---

## Fase 3: ⚪ OUTROS (5 problemas)

### @typescript-eslint/no-empty-object-type (5 ocorrências)

**Estratégia**: Análise manual necessária

**Arquivos mais afetados**:
- src\components\knowledge\personality\ideas\CardBasedConfigurationView.tsx (1 problemas)
- src\components\knowledge\personality\ideas\ModernConfigurationView.tsx (1 problemas)
- src\components\knowledge\personality\ideas\SidebarConfigurationView.tsx (1 problemas)
- src\components\knowledge\personality\ideas\SplitScreenConfigurationView.tsx (1 problemas)
- src\components\knowledge\personality\ideas\WizardConfigurationView.tsx (1 problemas)

---

## 🛠️ Comandos Úteis

```bash
# Auto-corrigir problemas simples
npx eslint src --ext .ts,.tsx --fix

# Verificar apenas erros críticos
npx eslint src --ext .ts,.tsx --quiet

# Gerar relatório detalhado
npx eslint src --ext .ts,.tsx --format=json --output-file eslint-detailed.json
```
