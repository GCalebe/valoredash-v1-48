# 🎯 Estratégias de Refatoração - ValoreDash v1.48

## 📋 Templates e Padrões para Refatoração

---

## 🏗️ PADRÃO 1: Separação de Componentes Grandes

### Template para Headers Repetitivos

**Antes (FAQHeader.tsx - 181 linhas):**
```typescript
// Um componente gigante com todas as funcionalidades
const FAQHeader = ({ searchTerm, onSearchChange, onAddFAQ, ... }) => {
  // 181 linhas de código
}
```

**Depois (Estrutura modular):**
```typescript
// components/common/headers/BaseHeader.tsx
interface BaseHeaderProps {
  title: string;
  icon: React.ComponentType;
  children?: React.ReactNode;
}

export const BaseHeader: React.FC<BaseHeaderProps> = ({ title, icon: Icon, children }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
};

// components/common/headers/SearchAndFilters.tsx
export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Buscar..."
}) => {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

// components/knowledge/faq/FAQHeader.tsx (Refatorado - ~50 linhas)
export const FAQHeader: React.FC<FAQHeaderProps> = (props) => {
  return (
    <BaseHeader title="FAQ" icon={HelpCircle}>
      <Button onClick={props.onAddFAQ} className="gap-2">
        <Plus className="h-4 w-4" />
        Adicionar FAQ
      </Button>
    </BaseHeader>
    <div className="flex items-center justify-between gap-4">
      <SearchAndFilters
        searchTerm={props.searchTerm}
        onSearchChange={props.onSearchChange}
        placeholder="Buscar FAQs..."
      />
      <HeaderActions {...props} />
    </div>
  );
};
```

---

## 🏗️ PADRÃO 2: Separação de Hooks Complexos

### Template para useProducts.ts (637 linhas)

**Antes (Monolítico):**
```typescript
// hooks/useProducts.ts - 637 linhas
export const useProducts = () => {
  // Queries, mutations, cache, validations tudo junto
};
```

**Depois (Modular):**
```typescript
// hooks/products/useProductsQuery.ts
export const useProductsQuery = () => {
  return useQuery({
    queryKey: productsKeys.lists(),
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductsByCategory = (category: string) => {
  return useQuery({
    queryKey: productsKeys.byCategory(category),
    queryFn: () => fetchProductsByCategory(category),
    enabled: !!category,
  });
};

// hooks/products/useProductsMutations.ts
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
};

// hooks/products/useProductsValidation.ts
export const useProductsValidation = () => {
  const validateProduct = useCallback((product: ProductFormData) => {
    // Lógica de validação específica
  }, []);
  
  return { validateProduct };
};

// hooks/products/index.ts (Barrel export)
export * from './useProductsQuery';
export * from './useProductsMutations';
export * from './useProductsValidation';

// services/productsService.ts
export const productsService = {
  async fetchProducts() {
    // Lógica de fetch
  },
  
  async createProduct(data: ProductFormData) {
    // Lógica de criação
  },
};
```

---

## 🏗️ PADRÃO 3: Separação de Páginas Complexas

### Template para ThemeSettings.tsx (472 linhas)

**Antes (Monolítico):**
```typescript
// pages/ThemeSettings.tsx - 472 linhas
const ThemeSettings = () => {
  // Estado, handlers, validações, UI tudo junto
};
```

**Depois (Modular):**
```typescript
// hooks/useThemeSettingsLogic.ts
export const useThemeSettingsLogic = () => {
  const [settings, setSettings] = useState(initialSettings);
  
  const handleLogoUpload = useCallback(async (file: File) => {
    // Lógica de upload
  }, []);
  
  const handleColorChange = useCallback((color: string) => {
    // Lógica de mudança de cor
  }, []);
  
  return {
    settings,
    handleLogoUpload,
    handleColorChange,
  };
};

// components/theme/ThemeSettingsHeader.tsx
export const ThemeSettingsHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Configurações de Tema</h1>
      </div>
    </div>
  );
};

// components/theme/LogoUploadSection.tsx
export const LogoUploadSection: React.FC<LogoUploadProps> = ({
  currentLogo,
  onLogoUpload,
  loading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo da Empresa</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Lógica específica de upload */}
      </CardContent>
    </Card>
  );
};

// pages/ThemeSettings.tsx (Refatorado - ~100 linhas)
const ThemeSettings = () => {
  const themeLogic = useThemeSettingsLogic();
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <ThemeSettingsHeader />
        <div className="grid gap-6">
          <LogoUploadSection {...themeLogic} />
          <ColorCustomizationPanel {...themeLogic} />
          <ThemePreviewSection {...themeLogic} />
        </div>
      </main>
    </div>
  );
};
```

---

## 🔧 FERRAMENTAS E SCRIPTS DE REFATORAÇÃO

### Script PowerShell para Análise de Complexidade

```powershell
# analyze-complexity.ps1
function Get-FileComplexity {
    param(
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    $lines = ($content -split "`n").Count
    $functions = ($content | Select-String "(function|const.*=.*=>|export.*function)" -AllMatches).Matches.Count
    $useEffects = ($content | Select-String "useEffect" -AllMatches).Matches.Count
    $useState = ($content | Select-String "useState" -AllMatches).Matches.Count
    
    return @{
        File = $FilePath
        Lines = $lines
        Functions = $functions
        UseEffects = $useEffects
        UseState = $useState
        ComplexityScore = $lines + ($functions * 2) + ($useEffects * 3) + ($useState * 2)
    }
}

# Analisar todos os arquivos TypeScript/TSX
Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | 
    ForEach-Object { Get-FileComplexity $_.FullName } |
    Sort-Object ComplexityScore -Descending |
    Select-Object -First 20 |
    Format-Table -AutoSize
```

### Script para Gerar Estrutura de Refatoração

```powershell
# generate-refactor-structure.ps1
function New-RefactorStructure {
    param(
        [string]$ComponentName,
        [string]$BasePath = "src/components"
    )
    
    $componentDir = "$BasePath/$ComponentName"
    
    # Criar estrutura de diretórios
    New-Item -ItemType Directory -Path "$componentDir" -Force
    New-Item -ItemType Directory -Path "$componentDir/components" -Force
    New-Item -ItemType Directory -Path "$componentDir/hooks" -Force
    New-Item -ItemType Directory -Path "$componentDir/utils" -Force
    
    # Criar arquivos base
    @"
// $componentDir/index.ts
export * from './$ComponentName';
export * from './components';
export * from './hooks';
"@ | Out-File "$componentDir/index.ts"
    
    @"
// $componentDir/components/index.ts
// Export all sub-components here
"@ | Out-File "$componentDir/components/index.ts"
    
    Write-Host "Estrutura criada em: $componentDir" -ForegroundColor Green
}

# Exemplo de uso:
# New-RefactorStructure -ComponentName "ThemeSettings"
```

---

## 📊 MÉTRICAS DE QUALIDADE

### Critérios para Avaliação

```typescript
// utils/codeQualityMetrics.ts
export interface QualityMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  numberOfFunctions: number;
  numberOfHooks: number;
  numberOfProps: number;
  testCoverage: number;
}

export const calculateQualityScore = (metrics: QualityMetrics): number => {
  let score = 100;
  
  // Penalizar arquivos muito grandes
  if (metrics.linesOfCode > 200) score -= (metrics.linesOfCode - 200) * 0.1;
  
  // Penalizar complexidade alta
  if (metrics.cyclomaticComplexity > 10) score -= (metrics.cyclomaticComplexity - 10) * 2;
  
  // Penalizar muitas funções em um arquivo
  if (metrics.numberOfFunctions > 5) score -= (metrics.numberOfFunctions - 5) * 3;
  
  // Bonificar boa cobertura de testes
  score += metrics.testCoverage * 0.2;
  
  return Math.max(0, Math.min(100, score));
};

export const getRefactoringPriority = (score: number): 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (score < 40) return 'HIGH';
  if (score < 70) return 'MEDIUM';
  return 'LOW';
};
```

---

## 🧪 ESTRATÉGIAS DE TESTE

### Template para Testes de Componentes Refatorados

```typescript
// __tests__/ThemeSettings.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSettings } from '../ThemeSettings';
import { useThemeSettingsLogic } from '../hooks/useThemeSettingsLogic';

// Mock do hook customizado
jest.mock('../hooks/useThemeSettingsLogic');
const mockUseThemeSettingsLogic = useThemeSettingsLogic as jest.MockedFunction<typeof useThemeSettingsLogic>;

describe('ThemeSettings', () => {
  beforeEach(() => {
    mockUseThemeSettingsLogic.mockReturnValue({
      settings: mockSettings,
      handleLogoUpload: jest.fn(),
      handleColorChange: jest.fn(),
    });
  });
  
  it('should render all sections', () => {
    render(<ThemeSettings />);
    
    expect(screen.getByText('Logo da Empresa')).toBeInTheDocument();
    expect(screen.getByText('Personalização de Cores')).toBeInTheDocument();
    expect(screen.getByText('Visualização')).toBeInTheDocument();
  });
  
  it('should handle logo upload', async () => {
    const mockHandleLogoUpload = jest.fn();
    mockUseThemeSettingsLogic.mockReturnValue({
      ...mockReturnValue,
      handleLogoUpload: mockHandleLogoUpload,
    });
    
    render(<ThemeSettings />);
    
    const fileInput = screen.getByLabelText(/upload logo/i);
    const file = new File(['logo'], 'logo.png', { type: 'image/png' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(mockHandleLogoUpload).toHaveBeenCalledWith(file);
  });
});
```

---

## 📝 CHECKLIST DE VALIDAÇÃO

### Antes de Considerar a Refatoração Completa

- [ ] **Funcionalidade preservada:** Todos os recursos funcionam como antes
- [ ] **Performance mantida:** Não há degradação de performance
- [ ] **Testes passando:** Todos os testes unitários e de integração passam
- [ ] **TypeScript limpo:** Sem erros de tipo
- [ ] **ESLint limpo:** Sem warnings ou errors
- [ ] **Bundle size:** Tamanho do bundle não aumentou significativamente
- [ ] **Acessibilidade:** Funcionalidades de acessibilidade preservadas
- [ ] **Responsividade:** Layout responsivo mantido
- [ ] **Documentação:** README e comentários atualizados

---

## 🎯 BENEFÍCIOS MENSURÁVEIS

### Métricas de Sucesso

| Métrica | Antes | Meta Após Refatoração |
|---------|-------|----------------------|
| Linhas por arquivo | >400 | <200 |
| Complexidade ciclomática | >15 | <10 |
| Tempo de build | Baseline | -20% |
| Cobertura de testes | 60% | 80% |
| Tempo de desenvolvimento | Baseline | -30% |
| Bugs por sprint | Baseline | -40% |

---

**Última atualização:** 2025-01-04
**Versão:** 1.0
**Responsável:** Equipe de Desenvolvimento