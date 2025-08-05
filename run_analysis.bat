@echo off
echo ===============================================
echo    Analisador de Conexoes Supabase
echo    ValoreDash - Dados Mockados e Conexoes
echo ===============================================
echo.

echo [1] Executar analise completa (Python + PowerShell)
echo [2] Executar apenas analise rapida (PowerShell)
echo [3] Ver relatorio JSON existente
echo [4] Limpar arquivos de relatorio
echo [5] Sair
echo.

set /p choice="Escolha uma opcao (1-5): "

if "%choice%"=="1" goto full_analysis
if "%choice%"=="2" goto quick_analysis
if "%choice%"=="3" goto view_report
if "%choice%"=="4" goto clean_reports
if "%choice%"=="5" goto exit

echo Opcao invalida!
goto menu

:full_analysis
echo.
echo Executando analise completa...
echo ===============================================
python analyze_supabase_connections.py
if errorlevel 1 (
    echo.
    echo Erro ao executar script Python. Tentando apenas PowerShell...
    powershell -ExecutionPolicy Bypass -File analyze_supabase.ps1
) else (
    echo.
    echo Executando analise complementar do PowerShell...
    powershell -ExecutionPolicy Bypass -File analyze_supabase.ps1
)
goto end

:quick_analysis
echo.
echo Executando analise rapida...
echo ===============================================
powershell -ExecutionPolicy Bypass -File analyze_supabase.ps1
goto end

:view_report
echo.
if exist "supabase_analysis_report.json" (
    echo Abrindo relatorio JSON...
    notepad supabase_analysis_report.json
) else (
    echo Nenhum relatorio encontrado. Execute a analise primeiro.
)
goto end

:clean_reports
echo.
echo Limpando arquivos de relatorio...
if exist "supabase_analysis_report.json" del "supabase_analysis_report.json"
if exist "supabase_analysis_*.html" del "supabase_analysis_*.html"
echo Arquivos de relatorio removidos.
goto end

:end
echo.
echo ===============================================
echo Analise concluida!
echo.
echo Arquivos gerados:
if exist "supabase_analysis_report.json" echo - supabase_analysis_report.json
if exist "supabase_analysis_*.html" echo - Relatorio HTML
echo.
echo Pressione qualquer tecla para continuar...
pause >nul
goto exit

:exit
exit /b 0