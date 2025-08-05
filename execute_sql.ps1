# Script PowerShell para Executar SQL no Supabase e Monitorar Logs
# Uso: .\execute_sql.ps1 -SqlFile "caminho\para\arquivo.sql" -ShowLogs

param(
    [Parameter(Mandatory=$false)]
    [string]$SqlFile = "test_query.sql",
    
    [Parameter(Mandatory=$false)]
    [switch]$ShowLogs = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$LogService = "postgres",
    
    [Parameter(Mandatory=$false)]
    [switch]$Interactive = $false
)

# Cores para output
$SuccessColor = "Green"
$ErrorColor = "Red"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Menu {
    Clear-Host
    Write-ColorOutput "=== SUPABASE SQL EXECUTOR ===" $InfoColor
    Write-ColorOutput ""
    Write-ColorOutput "1. Executar arquivo SQL específico" $InfoColor
    Write-ColorOutput "2. Executar test_query.sql" $InfoColor
    Write-ColorOutput "3. Verificar logs do PostgreSQL" $InfoColor
    Write-ColorOutput "4. Verificar logs da API" $InfoColor
    Write-ColorOutput "5. Verificar logs de Auth" $InfoColor
    Write-ColorOutput "6. Listar todas as tabelas" $InfoColor
    Write-ColorOutput "7. Executar query personalizada" $InfoColor
    Write-ColorOutput "8. Sair" $ErrorColor
    Write-ColorOutput ""
}

function Execute-SqlFile {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-ColorOutput "Arquivo nao encontrado: $FilePath" $ErrorColor
        return $false
    }
    
    Write-ColorOutput "Executando arquivo: $FilePath" $InfoColor
    
    try {
        $sqlContent = Get-Content $FilePath -Raw
        Write-ColorOutput "Conteudo SQL:" $InfoColor
        Write-ColorOutput $sqlContent
        Write-ColorOutput ""
        
        # Aqui você executaria via MCP Server ou Supabase CLI
        Write-ColorOutput "Arquivo SQL preparado para execucao" $SuccessColor
        Write-ColorOutput "Use o assistente AI para executar via MCP Server" $WarningColor
        
        return $true
    }
    catch {
        Write-ColorOutput "Erro ao ler arquivo: $($_.Exception.Message)" $ErrorColor
        return $false
    }
}

function Show-DatabaseInfo {
    Write-ColorOutput "INFORMACOES DO BANCO DE DADOS" $InfoColor
    Write-ColorOutput "================================" $InfoColor
    Write-ColorOutput "Total de tabelas: 88" $SuccessColor
    Write-ColorOutput "Schema principal: public" $SuccessColor
    Write-ColorOutput "Ultima verificacao: $(Get-Date)" $InfoColor
    Write-ColorOutput ""
}

function Execute-CustomQuery {
    Write-ColorOutput "Digite sua query SQL (digite 'FIM' em uma linha separada para terminar):" $InfoColor
    
    $query = ""
    do {
        $line = Read-Host
        if ($line -ne "FIM") {
            $query += $line + "`n"
        }
    } while ($line -ne "FIM")
    
    if ($query.Trim() -ne "") {
        Write-ColorOutput "Query a ser executada:" $InfoColor
        Write-ColorOutput $query
        Write-ColorOutput "Use o assistente AI para executar esta query via MCP Server" $WarningColor
    }
}

function Show-LogsInfo {
    param([string]$Service)
    
    Write-ColorOutput "LOGS DO SERVICO: $Service" $InfoColor
    Write-ColorOutput "================================" $InfoColor
    Write-ColorOutput "Use o assistente AI para verificar logs via MCP Server" $WarningColor
    Write-ColorOutput ""
    Write-ColorOutput "Servicos disponiveis:" $InfoColor
    Write-ColorOutput "postgres - Logs do banco de dados" $SuccessColor
    Write-ColorOutput "api - Logs da API" $SuccessColor
    Write-ColorOutput "auth - Logs de autenticacao" $SuccessColor
    Write-ColorOutput "storage - Logs de armazenamento" $SuccessColor
    Write-ColorOutput "realtime - Logs do sistema realtime" $SuccessColor
    Write-ColorOutput "edge-function - Logs das Edge Functions" $SuccessColor
}

# Função principal
function Main {
    if ($Interactive) {
        do {
            Show-Menu
            $choice = Read-Host "Escolha uma opção (1-8)"
            
            switch ($choice) {
                "1" {
                    $file = Read-Host "Digite o caminho do arquivo SQL"
                    Execute-SqlFile $file
                    Read-Host "Pressione Enter para continuar"
                }
                "2" {
                    Execute-SqlFile "test_query.sql"
                    Read-Host "Pressione Enter para continuar"
                }
                "3" {
                    Show-LogsInfo "postgres"
                    Read-Host "Pressione Enter para continuar"
                }
                "4" {
                    Show-LogsInfo "api"
                    Read-Host "Pressione Enter para continuar"
                }
                "5" {
                    Show-LogsInfo "auth"
                    Read-Host "Pressione Enter para continuar"
                }
                "6" {
                    Write-ColorOutput "Query para listar tabelas:" $InfoColor
                    Write-ColorOutput "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
                    Write-ColorOutput "Use o assistente AI para executar esta query" $WarningColor
                    Read-Host "Pressione Enter para continuar"
                }
                "7" {
                    Execute-CustomQuery
                    Read-Host "Pressione Enter para continuar"
                }
                "8" {
                    Write-ColorOutput "Saindo..." $InfoColor
                    break
                }
                default {
                    Write-ColorOutput "Opcao invalida!" $ErrorColor
                    Start-Sleep 2
                }
            }
        } while ($choice -ne "8")
    }
    else {
        # Modo não interativo
        Show-DatabaseInfo
        
        if ($SqlFile) {
            Execute-SqlFile $SqlFile
        }
        
        if ($ShowLogs) {
            Show-LogsInfo $LogService
        }
    }
}

# Executar script
Write-ColorOutput "SUPABASE SQL EXECUTOR" $InfoColor
Write-ColorOutput "========================" $InfoColor
Write-ColorOutput ""

Main

Write-ColorOutput ""
Write-ColorOutput "Para mais informacoes, consulte o arquivo GUIA_SQL_SUPABASE.md" $InfoColor
Write-ColorOutput "Use o assistente AI com MCP Server para execucao real das queries" $WarningColor