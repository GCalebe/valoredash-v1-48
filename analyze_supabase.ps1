# Script PowerShell para Análise de Conexões Supabase
# Análise rápida de dados mockados e conexões soltas

param(
    [string]$OutputFormat = "console",
    [switch]$Detailed,
    [switch]$OnlyHighSeverity
)

Write-Host "Analisador de Conexoes Supabase - ValoreDash" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Função para análise rápida
function Invoke-QuickAnalysis {
    Write-Host "`nExecutando analise rapida..." -ForegroundColor Yellow
    
    $mockDataFiles = @()
    $supabaseFiles = @()
    $todoFiles = @()
    
    # Buscar arquivos com dados mockados
    Write-Host "Buscando dados mockados..." -ForegroundColor Gray
    $mockDataFiles += Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Select-String -Pattern "mockData" -List
    $mockDataFiles += Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Select-String -Pattern "mock_data" -List
    $mockDataFiles += Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Select-String -Pattern "MOCK_DATA" -List
    $mockDataFiles += Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Select-String -Pattern "hardcoded" -List
    
    # Buscar uso do Supabase
    Write-Host "Buscando uso do Supabase..." -ForegroundColor Gray
    $supabaseFiles += Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | Select-String -Pattern "supabase" -List
    $supabaseFiles += Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | Select-String -Pattern "useQuery" -List
    $supabaseFiles += Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx" | Select-String -Pattern "useMutation" -List
    
    # Buscar TODOs relacionados a dados
    Write-Host "Buscando TODOs..." -ForegroundColor Gray
    $todoFiles += Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Select-String -Pattern "TODO.*data" -List
    $todoFiles += Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Select-String -Pattern "FIXME.*mock" -List
    $todoFiles += Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Select-String -Pattern "HACK.*temp" -List
    
    # Resultados da análise rápida
    Write-Host "`nResultados da Analise Rapida:" -ForegroundColor Cyan
    Write-Host "   Arquivos com possiveis dados mock: $($mockDataFiles.Count)" -ForegroundColor Yellow
    Write-Host "   Arquivos usando Supabase: $($supabaseFiles.Count)" -ForegroundColor Green
    Write-Host "   Arquivos com TODOs de dados: $($todoFiles.Count)" -ForegroundColor Red
    
    if ($mockDataFiles.Count -gt 0) {
        Write-Host "`nArquivos com possiveis dados mock:" -ForegroundColor Yellow
        $mockDataFiles | Select-Object -First 10 | ForEach-Object {
            $relativePath = $_.Filename.Replace((Get-Location), ".")
            Write-Host "   - $relativePath (linha $($_.LineNumber))" -ForegroundColor Gray
        }
    }
}

# Análise de hooks personalizados
function Invoke-HooksAnalysis {
    Write-Host "`nAnalisando hooks personalizados..." -ForegroundColor Magenta
    
    $hooksDir = "src/hooks"
    if (Test-Path $hooksDir) {
        $hookFiles = Get-ChildItem -Path $hooksDir -Filter "*.ts" -Recurse
        
        $connectedHooks = @()
        $mockHooks = @()
        
        foreach ($hookFile in $hookFiles) {
            $content = Get-Content $hookFile.FullName -Raw
            
            # Verificar se usa Supabase
            if ($content -match "supabase|from|useQuery|useMutation") {
                $connectedHooks += $hookFile.Name
            }
            
            # Verificar se tem dados mock
            if ($content -match "mock|hardcoded|TODO.*data") {
                $mockHooks += $hookFile.Name
            }
        }
        
        Write-Host "   Total de hooks: $($hookFiles.Count)" -ForegroundColor White
        Write-Host "   Hooks conectados ao Supabase: $($connectedHooks.Count)" -ForegroundColor Green
        Write-Host "   Hooks com possiveis dados mock: $($mockHooks.Count)" -ForegroundColor Yellow
        
        if ($mockHooks.Count -gt 0) {
            Write-Host "`n   Hooks com possiveis issues:" -ForegroundColor Yellow
            $mockHooks | ForEach-Object {
                Write-Host "     - $_" -ForegroundColor Gray
            }
        }
    }
}

# Análise de componentes
function Invoke-ComponentsAnalysis {
    Write-Host "`nAnalisando componentes..." -ForegroundColor Blue
    
    $componentsDir = "src/components"
    if (Test-Path $componentsDir) {
        $componentFiles = Get-ChildItem -Path $componentsDir -Filter "*.tsx" -Recurse
        
        $dataComponents = @()
        $mockComponents = @()
        
        foreach ($componentFile in $componentFiles) {
            $content = Get-Content $componentFile.FullName -Raw
            
            # Verificar se manipula dados
            if ($content -match "useState|useEffect|data|loading") {
                $dataComponents += $componentFile.Name
            }
            
            # Verificar se tem dados hardcoded
            if ($content -match "mockData|hardcoded") {
                $mockComponents += $componentFile.Name
            }
        }
        
        Write-Host "   Total de componentes: $($componentFiles.Count)" -ForegroundColor White
        Write-Host "   Componentes que manipulam dados: $($dataComponents.Count)" -ForegroundColor Green
        Write-Host "   Componentes com possiveis dados mock: $($mockComponents.Count)" -ForegroundColor Yellow
    }
}

# Função principal
function Main {
    $ProjectRoot = Get-Location
    Write-Host "Diretorio do projeto: $ProjectRoot" -ForegroundColor Gray
    
    # Executar análise rápida
    Invoke-QuickAnalysis
    Invoke-HooksAnalysis
    Invoke-ComponentsAnalysis
    
    # Verificar se deve executar análise completa
    $PythonScript = "analyze_supabase_connections.py"
    if (Test-Path $PythonScript) {
        Write-Host "`nExecutando analise completa com Python..." -ForegroundColor Green
        
        try {
            python $PythonScript
        }
        catch {
            Write-Host "Erro ao executar script Python: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "`nScript Python nao encontrado. Executando apenas analise rapida." -ForegroundColor Yellow
    }
    
    Write-Host "`nAnalise concluida!" -ForegroundColor Green
    Write-Host "`nDicas:" -ForegroundColor Cyan
    Write-Host "   - Use -OutputFormat html para gerar relatorio HTML" -ForegroundColor Gray
    Write-Host "   - Use -OnlyHighSeverity para ver apenas issues criticas" -ForegroundColor Gray
    Write-Host "   - Use -Detailed para analise mais detalhada" -ForegroundColor Gray
}

# Executar script
Main