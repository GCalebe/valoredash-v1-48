# Script para encontrar arquivos legados no projeto
# Versao corrigida e otimizada

Write-Host "Iniciando analise de arquivos legados..." -ForegroundColor Cyan

$projectRoot = (Get-Location).Path
$srcPath = Join-Path $projectRoot "src"

# Lista de arquivos potencialmente legados baseada na conversa anterior
$knownLegacyFiles = @(
    "src\pages\ChatsDashboard.tsx",
    "src\components\chat\ChatsDashboard.tsx",
    "src\components\chat\ChatsDashboardSimple.tsx",
    "src\components\clients\ClientDetailSheet.tsx",
    "src\components\clients\ClientInfoPanelPipeline.tsx"
)

$legacyFiles = @()

Write-Host "Verificando arquivos conhecidos como potencialmente legados..." -ForegroundColor Yellow

foreach ($file in $knownLegacyFiles) {
    $fullPath = Join-Path $projectRoot $file
    if (Test-Path $fullPath) {
        Write-Host "Encontrado: $file" -ForegroundColor Red
        $legacyFiles += [PSCustomObject]@{
            Path = $file
            Reason = "Arquivo identificado como potencialmente legado na analise anterior"
            Category = "Conhecido"
        }
    } else {
        Write-Host "Nao encontrado: $file" -ForegroundColor Green
    }
}

# Buscar por arquivos com nomes similares que podem ser duplicatas
Write-Host "`nBuscando por arquivos duplicados ou similares..." -ForegroundColor Yellow

$duplicatePatterns = @(
    "*Dashboard*.tsx",
    "*ClientInfo*.tsx",
    "*ContactInfo*.tsx",
    "*ClientDetail*.tsx"
)

foreach ($pattern in $duplicatePatterns) {
    $files = Get-ChildItem -Path $srcPath -Recurse -Filter $pattern -File | Where-Object { $_.Extension -eq ".tsx" }
    if ($files.Count -gt 1) {
        Write-Host "Multiplos arquivos encontrados para padrao $pattern`:" -ForegroundColor Yellow
        foreach ($file in $files) {
            $relativePath = $file.FullName.Replace($projectRoot + "\", "")
            Write-Host "  - $relativePath" -ForegroundColor White
        }
    }
}

# Buscar por arquivos de teste orfaos
Write-Host "`nBuscando por arquivos de teste orfaos..." -ForegroundColor Yellow

$testFiles = Get-ChildItem -Path $srcPath -Recurse -Filter "*.test.*" -File -ErrorAction SilentlyContinue
$specFiles = Get-ChildItem -Path $srcPath -Recurse -Filter "*.spec.*" -File -ErrorAction SilentlyContinue

foreach ($testFile in ($testFiles + $specFiles)) {
    if ($testFile -ne $null) {
        $baseName = $testFile.BaseName -replace "\.(test|spec)$", ""
        $expectedFile = Join-Path $testFile.DirectoryName ($baseName + ".tsx")
        $expectedFileTs = Join-Path $testFile.DirectoryName ($baseName + ".ts")
        
        if (-not (Test-Path $expectedFile) -and -not (Test-Path $expectedFileTs)) {
            $relativePath = $testFile.FullName.Replace($projectRoot + "\", "")
            Write-Host "Arquivo de teste orfao: $relativePath" -ForegroundColor Red
            $legacyFiles += [PSCustomObject]@{
                Path = $relativePath
                Reason = "Arquivo de teste sem arquivo principal correspondente"
                Category = "Teste Orfao"
            }
        }
    }
}

# Buscar por arquivos com nomes suspeitos
Write-Host "`nBuscando por arquivos com nomes suspeitos..." -ForegroundColor Yellow

$suspiciousPatterns = @(
    "*Old*",
    "*Backup*",
    "*Copy*",
    "*Temp*",
    "*Test*",
    "*Demo*",
    "*Example*"
)

foreach ($pattern in $suspiciousPatterns) {
    $files = Get-ChildItem -Path $srcPath -Recurse -Filter "$pattern.tsx" -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if ($file -ne $null) {
            $relativePath = $file.FullName.Replace($projectRoot + "\", "")
            Write-Host "Arquivo suspeito: $relativePath" -ForegroundColor Yellow
            $legacyFiles += [PSCustomObject]@{
                Path = $relativePath
                Reason = "Nome sugere arquivo temporario ou de teste"
                Category = "Suspeito"
            }
        }
    }
}

# Relatorio final
Write-Host "`n" + "=" * 50 -ForegroundColor Magenta
Write-Host "RELATORIO DE ARQUIVOS LEGADOS" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

if ($legacyFiles.Count -eq 0) {
    Write-Host "Nenhum arquivo legado encontrado!" -ForegroundColor Green
} else {
    Write-Host "Encontrados $($legacyFiles.Count) arquivos potencialmente legados:" -ForegroundColor Yellow
    Write-Host ""
    
    $groupedFiles = $legacyFiles | Group-Object Category
    
    foreach ($group in $groupedFiles) {
        Write-Host "$($group.Name) ($($group.Count) arquivos):" -ForegroundColor Cyan
        foreach ($file in $group.Group) {
            Write-Host "   - $($file.Path)" -ForegroundColor White
            Write-Host "     Motivo: $($file.Reason)" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# Salvar relatorio
$reportPath = Join-Path $projectRoot "legacy-files-report.txt"
$reportContent = @()
$reportContent += "RELATORIO DE ARQUIVOS LEGADOS"
$reportContent += "Gerado em: $(Get-Date)"
$reportContent += "=" * 50
$reportContent += ""

if ($legacyFiles.Count -eq 0) {
    $reportContent += "Nenhum arquivo legado encontrado!"
} else {
    $reportContent += "Encontrados $($legacyFiles.Count) arquivos potencialmente legados:"
    $reportContent += ""
    
    $groupedFiles = $legacyFiles | Group-Object Category
    foreach ($group in $groupedFiles) {
        $reportContent += "$($group.Name) ($($group.Count) arquivos):"
        foreach ($file in $group.Group) {
            $reportContent += "   - $($file.Path)"
            $reportContent += "     Motivo: $($file.Reason)"
        }
        $reportContent += ""
    }
}

# Adicionar recomendacoes
$reportContent += "RECOMENDACOES:"
$reportContent += "1. Verifique se os arquivos 'Conhecidos' ainda sao necessarios"
$reportContent += "2. Remova arquivos de teste orfaos se nao forem mais necessarios"
$reportContent += "3. Considere renomear ou remover arquivos 'Suspeitos'"
$reportContent += "4. Verifique se ha duplicatas funcionais entre arquivos similares"

$reportContent | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "Relatorio salvo em: $reportPath" -ForegroundColor Green
Write-Host "Analise concluida!" -ForegroundColor Magenta

# Mostrar resumo rapido
Write-Host "`nRESUMO RAPIDO:" -ForegroundColor Cyan
Write-Host "- Arquivos conhecidos como legados: $($legacyFiles | Where-Object {$_.Category -eq 'Conhecido'} | Measure-Object | Select-Object -ExpandProperty Count)"
Write-Host "- Arquivos de teste orfaos: $($legacyFiles | Where-Object {$_.Category -eq 'Teste Orfao'} | Measure-Object | Select-Object -ExpandProperty Count)"
Write-Host "- Arquivos suspeitos: $($legacyFiles | Where-Object {$_.Category -eq 'Suspeito'} | Measure-Object | Select-Object -ExpandProperty Count)"
Write-Host "- Total: $($legacyFiles.Count) arquivos"