# 📊 Relatório Detalhado de Problemas ESLint

**Total de problemas encontrados: 76**

- 🔴 Erros: 15
- 🟡 Avisos: 61
- 🔧 Auto-corrigíveis: 0

## 📈 Distribuição por Prioridade

- 🔴 CRÍTICO: 10 problemas
- 🟡 MÉDIO: 61 problemas
- ⚪ OUTROS: 5 problemas

---

## 🏆 Top 10 Regras Mais Violadas

1. **react-hooks/exhaustive-deps** (47 ocorrências) - 🟡 MÉDIO
2. **react-refresh/only-export-components** (14 ocorrências) - 🟡 MÉDIO
3. **@typescript-eslint/no-explicit-any** (10 ocorrências) - 🔴 CRÍTICO
4. **@typescript-eslint/no-empty-object-type** (5 ocorrências) - ⚪ OUTROS

---

## 🔴 CRÍTICO (10 problemas)

### 📋 @typescript-eslint/no-explicit-any (10 ocorrências)

**Estratégia de correção**: Substituir 'any' por tipos específicos

**Arquivos afetados**:

#### 📁 src\components\knowledge\personality\AdvancedSettingsSection.tsx (1 problemas)

- **Linha 11:60** 🔴 - Unexpected any. Specify a different type.

#### 📁 src\components\knowledge\personality\ConfigurationView.tsx (1 problemas)

- **Linha 18:64** 🔴 - Unexpected any. Specify a different type.

#### 📁 src\components\knowledge\personality\ideas\CardBasedConfigurationView.tsx (1 problemas)

- **Linha 20:69** 🔴 - Unexpected any. Specify a different type.

#### 📁 src\components\knowledge\personality\ideas\ModernConfigurationView.tsx (1 problemas)

- **Linha 22:69** 🔴 - Unexpected any. Specify a different type.

#### 📁 src\components\knowledge\personality\ideas\SidebarConfigurationView.tsx (1 problemas)

- **Linha 23:69** 🔴 - Unexpected any. Specify a different type.

#### 📁 src\components\knowledge\personality\ideas\SplitScreenConfigurationView.tsx (1 problemas)

- **Linha 26:69** 🔴 - Unexpected any. Specify a different type.

#### 📁 src\components\knowledge\personality\ideas\WizardConfigurationView.tsx (1 problemas)

- **Linha 23:69** 🔴 - Unexpected any. Specify a different type.

#### 📁 src\components\knowledge\products\ProductForm.tsx (1 problemas)

- **Linha 220:32** 🔴 - Unexpected any. Specify a different type.

#### 📁 src\components\knowledge\tabs\HostsTab.tsx (1 problemas)

- **Linha 202:46** 🔴 - Unexpected any. Specify a different type.

#### 📁 src\hooks\useFAQManagement.ts (1 problemas)

- **Linha 103:26** 🔴 - Unexpected any. Specify a different type.

---

## 🟡 MÉDIO (61 problemas)

### 📋 react-hooks/exhaustive-deps (47 ocorrências)

**Estratégia de correção**: Adicionar dependências faltantes no useEffect

**Arquivos afetados**:

#### 📁 src\app\chat-optimized\page.tsx (1 problemas)

- **Linha 98:9** 🟡 - The 'loadChats' function makes the dependencies of useEffect Hook (at line 129) change on every render. Move it inside the useEffect callback. Alternatively, wrap the definition of 'loadChats' in its own useCallback() Hook.

#### 📁 src\app\contextual-memory-viewer\page.tsx (1 problemas)

- **Linha 58:6** 🟡 - React Hook useEffect has a missing dependency: 'loadSessions'. Either include it or remove the dependency array.

#### 📁 src\app\episodic-memory-viewer\page.tsx (1 problemas)

- **Linha 58:6** 🟡 - React Hook useEffect has a missing dependency: 'loadSessions'. Either include it or remove the dependency array.

#### 📁 src\app\memory-dashboard\page.tsx (1 problemas)

- **Linha 61:6** 🟡 - React Hook useEffect has a missing dependency: 'loadSessions'. Either include it or remove the dependency array.

#### 📁 src\components\DiagnosticPanel.tsx (1 problemas)

- **Linha 109:9** 🟡 - The 'runDiagnostics' function makes the dependencies of useEffect Hook (at line 190) change on every render. To fix this, wrap the definition of 'runDiagnostics' in its own useCallback() Hook.

#### 📁 src\components\SemanticMemoryViewer.tsx (1 problemas)

- **Linha 65:6** 🟡 - React Hook useEffect has a missing dependency: 'loadEntities'. Either include it or remove the dependency array.

#### 📁 src\components\chat\ChatHeader.tsx (1 problemas)

- **Linha 46:6** 🟡 - React Hook useEffect has a missing dependency: 'searchTerm'. Either include it or remove the dependency array.

#### 📁 src\components\chat\NotesField.tsx (1 problemas)

- **Linha 32:6** 🟡 - React Hook useEffect has a missing dependency: 'loadNotes'. Either include it or remove the dependency array.

#### 📁 src\components\clients\AddClientDialog.tsx (1 problemas)

- **Linha 84:6** 🟡 - React Hook useEffect has a missing dependency: 'loadCustomFields'. Either include it or remove the dependency array.

#### 📁 src\components\clients\ClientProductsTab.tsx (1 problemas)

- **Linha 50:6** 🟡 - React Hook useEffect has missing dependencies: 'client?.id' and 'loadClientProducts'. Either include them or remove the dependency array.

#### 📁 src\components\knowledge\products\ObjectionsManager.tsx (1 problemas)

- **Linha 93:6** 🟡 - React Hook useEffect has a missing dependency: 'loadObjections'. Either include it or remove the dependency array.

#### 📁 src\components\metrics\ConversionFunnelChart.tsx (1 problemas)

- **Linha 45:9** 🟡 - The 'stageColors' array makes the dependencies of useEffect Hook (at line 90) change on every render. Move it inside the useEffect callback. Alternatively, wrap the initialization of 'stageColors' in its own useMemo() Hook.

#### 📁 src\hooks\useAgendaAvailability.ts (2 problemas)

- **Linha 258:6** 🟡 - React Hook useCallback has an unnecessary dependency: 'availableDates'. Either exclude it or remove the dependency array.
- **Linha 276:6** 🟡 - React Hook useEffect has missing dependencies: 'fetchAvailableDates' and 'fetchOperatingHours'. Either include them or remove the dependency array.

#### 📁 src\hooks\useCalendarEvents.tsx (1 problemas)

- **Linha 65:6** 🟡 - React Hook React.useEffect has a missing dependency: 'fetchEventsForMonth'. Either include it or remove the dependency array.

#### 📁 src\hooks\useChatMessages.ts (1 problemas)

- **Linha 163:6** 🟡 - React Hook useEffect has a missing dependency: 'fetchMessages'. Either include it or remove the dependency array.

#### 📁 src\hooks\useClientCustomFields.ts (1 problemas)

- **Linha 43:6** 🟡 - React Hook useEffect has a missing dependency: 'contactId'. Either include it or remove the dependency array.

#### 📁 src\hooks\useClientDataFetch.ts (1 problemas)

- **Linha 95:6** 🟡 - React Hook useEffect has missing dependencies: 'selectedConversation.clientName', 'selectedConversation.clientSize', 'selectedConversation.clientType', 'selectedConversation.email', 'selectedConversation.id', 'selectedConversation.name', and 'selectedConversation.phone'. Either include them or remove the dependency array.

#### 📁 src\hooks\useClientFiles.ts (1 problemas)

- **Linha 26:6** 🟡 - React Hook useEffect has missing dependencies: 'loadClientFiles' and 'loadStorageUsage'. Either include them or remove the dependency array.

#### 📁 src\hooks\useContactsData.ts (1 problemas)

- **Linha 76:6** 🟡 - React Hook useEffect has a missing dependency: 'fetchClients'. Either include it or remove the dependency array.

#### 📁 src\hooks\useConversationMetrics.ts (1 problemas)

- **Linha 216:6** 🟡 - React Hook useCallback has a missing dependency: 'toast'. Either include it or remove the dependency array.

#### 📁 src\hooks\useConversations.ts (1 problemas)

- **Linha 226:6** 🟡 - React Hook useEffect has a missing dependency: 'fetchConversations'. Either include it or remove the dependency array.

#### 📁 src\hooks\useDashboardRealtime.ts (1 problemas)

- **Linha 166:6** 🟡 - React Hook useEffect has missing dependencies: 'debouncedInvalidateClientStats', 'debouncedInvalidateConversations', 'debouncedInvalidateSchedule', 'debouncedInvalidateServices', and 'debouncedInvalidateUTM'. Either include them or remove the dependency array.

#### 📁 src\hooks\useDynamicFields.ts (1 problemas)

- **Linha 170:6** 🟡 - React Hook useCallback has missing dependencies: 'handleValidation' and 'updateState'. Either include them or remove the dependency array.

#### 📁 src\hooks\useEpisodicMemory.ts (6 problemas)

- **Linha 80:6** 🟡 - React Hook useCallback has missing dependencies: 'fetchMemories' and 'fetchTimeline'. Either include them or remove the dependency array.
- **Linha 105:5** 🟡 - React Hook useCallback has a missing dependency: 'sessionId'. Either include it or remove the dependency array.
- **Linha 141:5** 🟡 - React Hook useCallback has missing dependencies: 'fetchTimeline' and 'storeMemoryQuery'. Either include them or remove the dependency array.
- **Linha 169:5** 🟡 - React Hook useCallback has missing dependencies: 'fetchTimeline' and 'updateImportanceQuery'. Either include them or remove the dependency array.
- **Linha 180:6** 🟡 - React Hook useEffect has a missing dependency: 'loadEpisodicData'. Either include it or remove the dependency array.
- **Linha 191:6** 🟡 - React Hook useEffect has a missing dependency: 'loadEpisodicData'. Either include it or remove the dependency array.

#### 📁 src\hooks\useEventFormDialog.ts (2 problemas)

- **Linha 256:6** 🟡 - React Hook useEffect has missing dependencies: 'checkBlockedDate', 'determineAttendanceInfo', 'determineInitialStatus', 'findClientInfo', 'findServiceInfo', 'resetFormState', 'setBasicEventInfo', and 'updateState'. Either include them or remove the dependency array.
- **Linha 265:6** 🟡 - React Hook useEffect has a missing dependency: 'updateState'. Either include it or remove the dependency array.

#### 📁 src\hooks\useKanbanStages.ts (2 problemas)

- **Linha 77:6** 🟡 - React Hook useCallback has missing dependencies: 'loadStagesFromLocalStorage' and 'saveStageToLocalStorage'. Either include them or remove the dependency array.
- **Linha 112:6** 🟡 - React Hook useEffect has a missing dependency: 'fetchStages'. Either include it or remove the dependency array.

#### 📁 src\hooks\useKanbanStagesSupabase.ts (1 problemas)

- **Linha 253:6** 🟡 - React Hook useEffect has a missing dependency: 'fetchStages'. Either include it or remove the dependency array.

#### 📁 src\hooks\useNotifications.ts (1 problemas)

- **Linha 113:6** 🟡 - React Hook useEffect has a missing dependency: 'loadNotifications'. Either include it or remove the dependency array.

#### 📁 src\hooks\useOptimizedContactsData.ts (1 problemas)

- **Linha 140:6** 🟡 - React Hook useEffect has a missing dependency: 'fetchClients'. Either include it or remove the dependency array.

#### 📁 src\hooks\useOptimizedHosts.ts (1 problemas)

- **Linha 102:6** 🟡 - React Hook useEffect has a missing dependency: 'fetchHosts'. Either include it or remove the dependency array.

#### 📁 src\hooks\useOptimizedRealtime.ts (1 problemas)

- **Linha 187:6** 🟡 - React Hook useEffect has missing dependencies: 'cleanup', 'setupClientUpdates', 'setupConversationUpdates', 'setupMetricsUpdates', and 'setupPolling'. Either include them or remove the dependency array.

#### 📁 src\hooks\useRealTimeMetrics.ts (1 problemas)

- **Linha 133:6** 🟡 - React Hook useEffect has missing dependencies: 'debouncedInvalidateLeads' and 'debouncedInvalidateMetrics'. Either include them or remove the dependency array.

#### 📁 src\hooks\useSubscription.ts (3 problemas)

- **Linha 68:6** 🟡 - React Hook useCallback has missing dependencies: 'loadInvoices', 'loadPaymentMethods', 'loadSubscription', 'toast', and 'user'. Either include them or remove the dependency array.
- **Linha 91:6** 🟡 - React Hook useCallback has a missing dependency: 'availablePlans'. Either include it or remove the dependency array.
- **Linha 97:6** 🟡 - React Hook useEffect has a missing dependency: 'user'. Either include it or remove the dependency array.

#### 📁 src\hooks\useSubscriptionPageData.ts (1 problemas)

- **Linha 11:9** 🟡 - The 'availablePlans' conditional could make the dependencies of useMemo Hook (at line 22) change on every render. To fix this, wrap the initialization of 'availablePlans' in its own useMemo() Hook.

#### 📁 src\hooks\useSupabaseContactsData.ts (1 problemas)

- **Linha 161:32** 🟡 - React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array.

#### 📁 src\hooks\useSupabaseSchedule.ts (1 problemas)

- **Linha 179:6** 🟡 - React Hook useEffect has a missing dependency: 'fetchEvents'. Either include it or remove the dependency array.

#### 📁 src\hooks\useUserProfile.ts (1 problemas)

- **Linha 28:6** 🟡 - React Hook useEffect has a missing dependency: 'user'. Either include it or remove the dependency array.

---

### 📋 react-refresh/only-export-components (14 ocorrências)

**Estratégia de correção**: Mover constantes/funções para arquivos separados

**Arquivos afetados**:

#### 📁 src\components\animate-ui\base\accordion.tsx (1 problemas)

- **Linha 183:3** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\components\clients\ClientFormValidation.tsx (1 problemas)

- **Linha 68:14** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\components\knowledge\tabs\AgendaTab.tsx (2 problemas)

- **Linha 99:14** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
- **Linha 122:14** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\components\knowledge\websites\WebsiteCard.tsx (1 problemas)

- **Linha 9:14** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\components\ui\badge.tsx (1 problemas)

- **Linha 36:17** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\components\ui\button.tsx (1 problemas)

- **Linha 67:18** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\components\ui\toggle.tsx (1 problemas)

- **Linha 43:18** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\components\ui\virtualized-list.tsx (1 problemas)

- **Linha 104:14** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\context\AuthContext.tsx (1 problemas)

- **Linha 71:17** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\context\SupabaseContext.tsx (1 problemas)

- **Linha 19:14** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\context\ThemeContext.tsx (1 problemas)

- **Linha 66:14** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\context\ThemeSettingsContext.tsx (1 problemas)

- **Linha 66:14** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

#### 📁 src\providers\QueryProvider.tsx (1 problemas)

- **Linha 29:10** 🟡 - Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.

---

## ⚪ OUTROS (5 problemas)

### 📋 @typescript-eslint/no-empty-object-type (5 ocorrências)

**Estratégia de correção**: Análise manual necessária

**Arquivos afetados**:

#### 📁 src\components\knowledge\personality\ideas\CardBasedConfigurationView.tsx (1 problemas)

- **Linha 14:11** 🔴 - An interface declaring no members is equivalent to its supertype.

#### 📁 src\components\knowledge\personality\ideas\ModernConfigurationView.tsx (1 problemas)

- **Linha 14:11** 🔴 - An interface declaring no members is equivalent to its supertype.

#### 📁 src\components\knowledge\personality\ideas\SidebarConfigurationView.tsx (1 problemas)

- **Linha 15:11** 🔴 - An interface declaring no members is equivalent to its supertype.

#### 📁 src\components\knowledge\personality\ideas\SplitScreenConfigurationView.tsx (1 problemas)

- **Linha 16:11** 🔴 - An interface declaring no members is equivalent to its supertype.

#### 📁 src\components\knowledge\personality\ideas\WizardConfigurationView.tsx (1 problemas)

- **Linha 15:11** 🔴 - An interface declaring no members is equivalent to its supertype.

---
